from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from appointments.models import Appointment, Availability, Doctor, Patient, Profile, Specialty

User = get_user_model()


class BookingTests(APITestCase):
    maxDiff = None

    def setUp(self) -> None:
        self.client = APIClient()
        self.specialty = Specialty.objects.create(name="General Medicine")

    def _create_doctor(self, username: str = "doctor1") -> Doctor:
        user = User.objects.create_user(username=username, password="pass123", first_name="Doc", last_name="Tor")
        Profile.objects.create(user=user, role=Profile.Role.DOCTOR)
        doctor = Doctor.objects.create(
            user=user,
            specialty=self.specialty,
            clinic_name="Clinic",
            about="About",
            consultation_fee="10000.00",
            is_active=True,
        )
        for weekday in range(0, 5):
            Availability.objects.create(
                doctor=doctor,
                weekday=weekday,
                start_time=time(9, 0),
                end_time=time(12, 0),
                slot_minutes=30,
            )
        return doctor

    def _create_patient(self, username: str = "patient1") -> Patient:
        user = User.objects.create_user(username=username, password="pass123", first_name="Pat", last_name="Ient")
        Profile.objects.create(user=user, role=Profile.Role.PATIENT)
        patient = Patient.objects.create(user=user, dob=date(1990, 1, 1))
        return patient

    def _auth_headers(self, username: str, password: str = "pass123") -> dict[str, str]:
        response = self.client.post("/api/auth/jwt/create", {"username": username, "password": password}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data["access"]
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_register_login_me(self) -> None:
        register_payload = {"username": "testuser", "password": "secret123"}
        response = self.client.post("/api/auth/register", register_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post("/api/auth/jwt/create", register_payload, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        token = login_response.data["access"]

        me_response = self.client.get("/api/auth/me", HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["profile"]["role"], Profile.Role.PATIENT)

    def test_slots_endpoint_respects_bookings(self) -> None:
        doctor = self._create_doctor()
        patient = self._create_patient()
        target_date = timezone.localdate() + timedelta(days=1)
        Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            date=target_date,
            start_time=time(9, 0),
            end_time=time(9, 30),
        )

        response = self.client.get(f"/api/doctors/{doctor.id}/slots/", {"date": target_date.isoformat()})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slots = response.json()
        self.assertNotIn({"start_time": "09:00", "end_time": "09:30"}, slots)
        self.assertIn({"start_time": "09:30", "end_time": "10:00"}, slots)

    def test_overlapping_booking_returns_400(self) -> None:
        doctor = self._create_doctor()
        patient = self._create_patient()
        Appointment.objects.create(
            doctor=doctor,
            patient=patient,
            date=timezone.localdate() + timedelta(days=1),
            start_time=time(9, 0),
            end_time=time(9, 30),
        )
        headers = self._auth_headers(patient.user.username)
        payload = {
            "doctor": doctor.id,
            "date": (timezone.localdate() + timedelta(days=1)).isoformat(),
            "start_time": "09:00",
            "end_time": "09:30",
        }
        response = self.client.post("/api/appointments/", payload, format="json", **headers)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_outside_availability(self) -> None:
        doctor = self._create_doctor()
        patient = self._create_patient()
        headers = self._auth_headers(patient.user.username)
        payload = {
            "doctor": doctor.id,
            "date": (timezone.localdate() + timedelta(days=1)).isoformat(),
            "start_time": "08:00",
            "end_time": "08:30",
        }
        response = self.client.post("/api/appointments/", payload, format="json", **headers)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_transitions(self) -> None:
        doctor = self._create_doctor("doctor_status")
        patient = self._create_patient("patient_status")
        patient_headers = self._auth_headers(patient.user.username)
        doctor_headers = self._auth_headers(doctor.user.username)

        payload = {
            "doctor": doctor.id,
            "date": (timezone.localdate() + timedelta(days=1)).isoformat(),
            "start_time": "09:00",
            "end_time": "09:30",
        }
        create_response = self.client.post("/api/appointments/", payload, format="json", **patient_headers)
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        appointment_id = create_response.data["id"]

        # Patient cannot confirm appointment
        patient_confirm = self.client.patch(
            f"/api/appointments/{appointment_id}/",
            {"status": Appointment.Status.CONFIRMED},
            format="json",
            **patient_headers,
        )
        self.assertEqual(patient_confirm.status_code, status.HTTP_400_BAD_REQUEST)

        # Doctor confirms
        doctor_confirm = self.client.patch(
            f"/api/appointments/{appointment_id}/",
            {"status": Appointment.Status.CONFIRMED},
            format="json",
            **doctor_headers,
        )
        self.assertEqual(doctor_confirm.status_code, status.HTTP_200_OK)

        # Doctor completes
        doctor_complete = self.client.patch(
            f"/api/appointments/{appointment_id}/",
            {"status": Appointment.Status.COMPLETED},
            format="json",
            **doctor_headers,
        )
        self.assertEqual(doctor_complete.status_code, status.HTTP_200_OK)

        # Patient cannot cancel completed appointment
        patient_cancel = self.client.patch(
            f"/api/appointments/{appointment_id}/",
            {"status": Appointment.Status.CANCELLED},
            format="json",
            **patient_headers,
        )
        self.assertEqual(patient_cancel.status_code, status.HTTP_400_BAD_REQUEST)
