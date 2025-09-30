from __future__ import annotations

from datetime import datetime, date, time, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from appointments.models import Appointment, Availability, Doctor, Patient, Profile, Specialty

User = get_user_model()


class AppointmentBookingTests(APITestCase):
    def setUp(self):
        self.password = "Test12345!"
        self.specialty = Specialty.objects.create(name="Cardiology")

        self.doctor_user = User.objects.create_user(
            username="doc_user",
            password=self.password,
            first_name="Doc",
            last_name="Tor",
            email="doc@example.com",
        )
        self.doctor_profile = Profile.objects.create(user=self.doctor_user, role=Profile.Role.DOCTOR, phone="08000000001")
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialty=self.specialty,
            clinic_name="Clinic",
            about="About",
            consultation_fee="10000.00",
            is_active=True,
        )

        self.patient_user = User.objects.create_user(
            username="pat_user",
            password=self.password,
            first_name="Pat",
            last_name="Ient",
            email="patient@example.com",
        )
        self.patient_profile = Profile.objects.create(user=self.patient_user, role=Profile.Role.PATIENT, phone="08000000002")
        self.patient = Patient.objects.create(user=self.patient_user, dob=date(1990, 1, 1))

        for weekday in range(7):
            Availability.objects.create(
                doctor=self.doctor,
                weekday=weekday,
                start_time=time(9, 0),
                end_time=time(12, 0),
                slot_minutes=30,
            )
            Availability.objects.create(
                doctor=self.doctor,
                weekday=weekday,
                start_time=time(13, 0),
                end_time=time(16, 0),
                slot_minutes=30,
            )

    def authenticate(self, user):
        response = self.client.post(
            "/api/auth/jwt/create",
            {"username": user.username, "password": self.password},
            format="json",
        )
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_register_login_me_flow(self):
        register_payload = {
            "username": "new_patient",
            "password": "Somepass123!",
            "dob": "1995-05-05",
            "phone": "08012345678",
        }
        response = self.client.post("/api/auth/register", register_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            "/api/auth/jwt/create",
            {"username": "new_patient", "password": "Somepass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access = login_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me_response = self.client.get("/api/auth/me")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["profile"]["role"], Profile.Role.PATIENT)

    def test_slots_exclude_booked(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            date=tomorrow,
            start_time=time(9, 30),
            end_time=time(10, 0),
            status=Appointment.Status.CONFIRMED,
        )

        response = self.client.get(f"/api/doctors/{self.doctor.id}/slots/?date={tomorrow.isoformat()}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slot_times = {slot["start_time"] for slot in response.data}
        self.assertNotIn("09:30", slot_times)
        for slot in response.data:
            self.assertEqual(slot["end_time"], (datetime.strptime(slot["start_time"], "%H:%M") + timedelta(minutes=30)).strftime("%H:%M"))

    def test_overlapping_appointment_rejected(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            date=tomorrow,
            start_time=time(9, 0),
            end_time=time(9, 30),
        )
        self.authenticate(self.patient_user)
        payload = {
            "doctor_id": self.doctor.id,
            "date": tomorrow.isoformat(),
            "start_time": "09:00",
            "end_time": "09:30",
        }
        response = self.client.post("/api/appointments/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_outside_availability_rejected(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        self.authenticate(self.patient_user)
        payload = {
            "doctor_id": self.doctor.id,
            "date": tomorrow.isoformat(),
            "start_time": "17:00",
            "end_time": "17:30",
        }
        response = self.client.post("/api/appointments/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_transitions(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            date=tomorrow,
            start_time=time(10, 0),
            end_time=time(10, 30),
        )

        self.authenticate(self.doctor_user)
        confirm_response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.CONFIRMED},
            format="json",
        )
        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)
        complete_response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.COMPLETED},
            format="json",
        )
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        invalid_response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.CONFIRMED},
            format="json",
        )
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
