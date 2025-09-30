from __future__ import annotations

from datetime import time

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from appointments.models import Appointment, DoctorProfile, Specialty, WeeklyAvailability
from appointments.services import generate_slots_for_doctor, is_slot_available

User = get_user_model()


class AppointmentFlowTests(TestCase):
    def setUp(self):
        self.specialty = Specialty.objects.create(name="Cardiology")
        self.doctor_user = User.objects.create_user(
            username="doc1",
            password="pass1234",
            first_name="Doc",
            last_name="Tor",
            email="doc@example.com",
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            specialty=self.specialty,
            bio="Experienced doctor",
            fee=5000,
            slot_length_minutes=30,
            is_active=True,
        )
        WeeklyAvailability.objects.create(
            doctor=self.doctor_profile,
            weekday=timezone.localdate().weekday(),
            start_time=time(9, 0),
            end_time=time(10, 0),
            slot_length_minutes=30,
        )
        self.patient_user = User.objects.create_user(
            username="patient1",
            password="pass1234",
            email="patient@example.com",
        )

    def test_generate_slots_for_doctor(self):
        start_date = timezone.localdate()
        slots = generate_slots_for_doctor(self.doctor_user, start_date, weeks=1)
        self.assertTrue(slots)
        self.assertEqual(len(slots), 2)
        self.assertLess(slots[0][0], slots[0][1])

    def test_appointment_conflict_detection(self):
        now_slot = generate_slots_for_doctor(self.doctor_user, timezone.localdate(), weeks=1)[0]
        appointment = Appointment.objects.create(
            patient=self.patient_user,
            doctor=self.doctor_user,
            start=now_slot[0],
            end=now_slot[1],
        )
        self.assertFalse(is_slot_available(self.doctor_user, now_slot[0], now_slot[1]))
        with self.assertRaises(ValidationError):
            Appointment.objects.create(
                patient=self.patient_user,
                doctor=self.doctor_user,
                start=now_slot[0],
                end=now_slot[1],
            )

    def _book_via_form(self):
        client = Client()
        client.login(username="patient1", password="pass1234")
        slot = generate_slots_for_doctor(self.doctor_user, timezone.localdate(), weeks=1)[0]
        response = client.post(
            reverse("appointment_book"),
            {
                "doctor": self.doctor_profile.pk,
                "date": slot[0].date(),
                "slot": slot[0].isoformat(),
                "reason": "Checkup",
            },
        )
        self.assertEqual(response.status_code, 302)
        appointment = Appointment.objects.latest("pk")
        self.assertEqual(appointment.status, Appointment.STATUS_PENDING)
        return appointment

    def test_patient_booking_flow(self):
        appointment = self._book_via_form()
        self.assertEqual(appointment.patient, self.patient_user)

    def test_doctor_approval_flow(self):
        appointment = self._book_via_form()
        client = Client()
        client.login(username="doc1", password="pass1234")
        response = client.post(reverse("appointment_approve", args=[appointment.pk]))
        self.assertEqual(response.status_code, 302)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, Appointment.STATUS_APPROVED)

    def test_patient_cannot_access_other_detail(self):
        appointment = self._book_via_form()
        other_user = User.objects.create_user(username="patient2", password="pass1234")
        client = Client()
        client.login(username="patient2", password="pass1234")
        detail_url = reverse("appointment_detail", args=[appointment.pk])
        response = client.get(detail_url)
        self.assertEqual(response.status_code, 404)

    def test_logout_redirects_home(self):
        client = Client()
        client.login(username="patient1", password="pass1234")
        response = client.get(reverse("logout"))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")

    def test_password_change(self):
        client = Client()
        client.login(username="patient1", password="pass1234")
        response = client.post(
            reverse("password_change"),
            {
                "old_password": "pass1234",
                "new_password1": "Newpass123!",
                "new_password2": "Newpass123!",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("password_change_done"))
        client.logout()
        self.assertTrue(client.login(username="patient1", password="Newpass123!"))
