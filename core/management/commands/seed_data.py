from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from doctors.models import Doctor
from patients.models import Patient


class Command(BaseCommand):
    help = "Seed initial data for the appointment system"

    def handle(self, *args, **options):
        User = get_user_model()

        admin, created = User.objects.get_or_create(
            email="admin@example.com",
            defaults={"role": User.Role.ADMIN, "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin user"))
        else:
            self.stdout.write("Admin user already exists")

        doctor_user, created = User.objects.get_or_create(
            email="doctor1@example.com",
            defaults={"role": User.Role.DOCTOR},
        )
        if created:
            doctor_user.set_password("doctor123")
            doctor_user.save()
        doctor, _ = Doctor.objects.get_or_create(
            user=doctor_user,
            defaults={
                "name": "Dr. Meredith Grey",
                "specialization": "General Surgery",
                "years_experience": 10,
                "bio": "Experienced surgeon specializing in complex cases.",
                "contact_info": "555-0100",
                "availability_rule": {
                    "monday": [{"start": "09:00", "end": "17:00"}],
                    "tuesday": [{"start": "09:00", "end": "17:00"}],
                    "wednesday": [{"start": "09:00", "end": "17:00"}],
                    "thursday": [{"start": "09:00", "end": "17:00"}],
                    "friday": [{"start": "09:00", "end": "15:00"}],
                },
            },
        )

        patient_user, created = User.objects.get_or_create(
            email="patient1@example.com",
            defaults={"role": User.Role.PATIENT},
        )
        if created:
            patient_user.set_password("patient123")
            patient_user.save()
        patient, _ = Patient.objects.get_or_create(
            user=patient_user,
            defaults={
                "name": "Alex Karev",
                "age": 32,
                "gender": "MALE",
                "contact_info": "555-0200",
            },
        )

        now = timezone.now()
        Appointment.objects.get_or_create(
            doctor=doctor,
            patient=patient,
            start_at=(now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0),
            defaults={
                "symptoms": "Severe abdominal pain requiring diagnosis.",
                "status": Appointment.Status.PENDING,
            },
        )
        Appointment.objects.get_or_create(
            doctor=doctor,
            patient=patient,
            start_at=(now + timedelta(days=2)).replace(hour=11, minute=0, second=0, microsecond=0),
            defaults={
                "symptoms": "Follow-up evaluation for previous treatment.",
                "status": Appointment.Status.APPROVED,
            },
        )

        self.stdout.write(self.style.SUCCESS("Seed data ready."))
