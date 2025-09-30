from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty


class AuthFlowTests(APITestCase):
    def test_register_login_me(self):
        response = self.client.post(
            "/api/auth/register",
            {
                "username": "testpatient",
                "password": "password123",
                "first_name": "Test",
                "last_name": "Patient",
                "phone": "1234567890",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            "/api/auth/jwt/create/",
            {"username": "testpatient", "password": "password123"},
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access = login_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        me_response = self.client.get("/api/auth/me")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["profile"]["role"], Profile.Role.PATIENT)


class AppointmentLogicTests(APITestCase):
    def setUp(self):
        self.specialty = Specialty.objects.create(name="Cardiology", slug="cardiology")
        self.doctor_user = User.objects.create_user("doc", "doc@example.com", "pass12345")
        Profile.objects.create(user=self.doctor_user, role=Profile.Role.DOCTOR, phone="111")
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialty=self.specialty,
            clinic_name="Clinic",
            about="About",
            consultation_fee=1000,
        )
        self.patient_user = User.objects.create_user("patient", "patient@example.com", "pass12345")
        Profile.objects.create(user=self.patient_user, role=Profile.Role.PATIENT, phone="222")
        self.patient = Patient.objects.create(user=self.patient_user, dob=date(1990, 1, 1))
        self.client.credentials()
        login = self.client.post(
            "/api/auth/jwt/create/",
            {"username": "patient", "password": "pass12345"},
        )
        self.access = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

        for weekday in range(7):
            Availability.objects.create(
                doctor=self.doctor,
                weekday=weekday,
                start_time=time(9, 0),
                end_time=time(12, 0),
                slot_minutes=30,
            )

    def _future_date(self, days: int) -> date:
        return timezone.localdate() + timedelta(days=days)

    def test_slots_endpoint_excludes_booked(self):
        target_date = self._future_date(1)
        Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            date=target_date,
            start_time=time(9, 0),
            end_time=time(9, 30),
        )
        response = self.client.get(f"/api/doctors/{self.doctor.id}/slots/?date={target_date}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slots = response.json()
        self.assertNotIn({"start_time": "09:00", "end_time": "09:30"}, slots)

    def test_overlapping_appointment_fails(self):
        target_date = self._future_date(2)
        Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            date=target_date,
            start_time=time(9, 0),
            end_time=time(9, 30),
        )
        response = self.client.post(
            "/api/appointments/",
            {
                "doctor": self.doctor.id,
                "date": target_date,
                "start_time": "09:15",
                "end_time": "09:45",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_outside_availability_fails(self):
        target_date = self._future_date(3)
        response = self.client.post(
            "/api/appointments/",
            {
                "doctor": self.doctor.id,
                "date": target_date,
                "start_time": "08:00",
                "end_time": "08:30",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_status_transitions(self):
        target_date = self._future_date(4)
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            date=target_date,
            start_time=time(9, 0),
            end_time=time(9, 30),
        )

        # patient cannot mark completed
        response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.COMPLETED},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # doctor confirms
        doctor_login = self.client.post(
            "/api/auth/jwt/create/",
            {"username": "doc", "password": "pass12345"},
        )
        doctor_access = doctor_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {doctor_access}")
        response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.CONFIRMED},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # invalid transition from confirmed to pending
        response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.PENDING},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # doctor completes
        response = self.client.patch(
            f"/api/appointments/{appointment.id}/",
            {"status": Appointment.Status.COMPLETED},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
