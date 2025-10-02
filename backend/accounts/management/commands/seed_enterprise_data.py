from __future__ import annotations

from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from appointments.models import Appointment
from doctors.models import Doctor
from patients.models import Patient


class Command(BaseCommand):
    help = "Seed the database with enterprise doctor appointment data."

    @transaction.atomic
    def handle(self, *args, **options):
        admin_user, _ = User.objects.get_or_create(
            email="admin@example.com",
            defaults={
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("admin123")
        admin_user.save()

        doctor_user, _ = User.objects.get_or_create(
            email="doctor1@example.com",
            defaults={
                "role": User.Role.DOCTOR,
            },
        )
        doctor_user.set_password("doctor123")
        doctor_user.is_staff = False
        doctor_user.save()

        doctor_profile, _ = Doctor.objects.get_or_create(
            user=doctor_user,
            defaults={
                "name": "Dr. John Doe",
                "specialization": "Cardiology",
                "years_of_experience": 10,
                "availability_schedule": {"monday": ["09:00", "12:00"]},
            },
        )

        patient_user, _ = User.objects.get_or_create(
            email="patient1@example.com",
            defaults={
                "role": User.Role.PATIENT,
            },
        )
        patient_user.set_password("patient123")
        patient_user.save()

        patient_profile, _ = Patient.objects.get_or_create(
            user=patient_user,
            defaults={
                "name": "Jane Patient",
                "age": 32,
                "gender": "Female",
                "contact_info": {"phone": "555-1234"},
            },
        )

        today = date.today()
        Appointment.objects.get_or_create(
            patient=patient_profile,
            doctor=doctor_profile,
            date=today + timedelta(days=1),
            time=time(10, 0),
            defaults={
                "symptoms": "Experiencing chest pains and shortness of breath.",
                "status": Appointment.Status.PENDING,
            },
        )
        Appointment.objects.get_or_create(
            patient=patient_profile,
            doctor=doctor_profile,
            date=today + timedelta(days=2),
            time=time(11, 30),
            defaults={
                "symptoms": "Follow-up appointment after treatment.",
                "status": Appointment.Status.APPROVED,
            },
        )

        self.stdout.write(self.style.SUCCESS("Enterprise data seeded successfully."))
