from __future__ import annotations

from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from appointments.models import Appointment
from doctors.models import Doctor
from patients.models import Patient


class Command(BaseCommand):
    help = "Seed initial data for the appointment system"

    def handle(self, *args, **options):
        admin_email = "admin@example.com"
        doctor_email = "doctor1@example.com"
        patient_email = "patient1@example.com"

        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={"role": User.Role.ADMIN, "is_staff": True, "is_superuser": True},
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin {admin_email}"))

        doctor_user, created = User.objects.get_or_create(
            email=doctor_email,
            defaults={"role": User.Role.DOCTOR, "is_active": True},
        )
        if created:
            doctor_user.set_password("doctor123")
            doctor_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created doctor user {doctor_email}"))

        patient_user, created = User.objects.get_or_create(
            email=patient_email,
            defaults={"role": User.Role.PATIENT, "is_active": True},
        )
        if created:
            patient_user.set_password("patient123")
            patient_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created patient user {patient_email}"))

        doctor_profile, _ = Doctor.objects.get_or_create(
            user=doctor_user,
            defaults={
                "name": "Dr. Meredith Grey",
                "specialization": "Cardiology",
                "years_experience": 10,
                "bio": "Experienced cardiologist with focus on preventive care.",
                "contact_info": "555-0101",
                "availability_rule": [
                    {"weekday": 0, "start": "09:00", "end": "12:00"},
                    {"weekday": 2, "start": "13:00", "end": "17:00"},
                ],
            },
        )

        patient_profile, _ = Patient.objects.get_or_create(
            user=patient_user,
            defaults={
                "name": "John Doe",
                "age": 30,
                "gender": "Male",
                "contact_info": "john.doe@example.com",
            },
        )

        now = timezone.now()
        # Ensure seed appointments align with availability (next Monday 09:00 and Wednesday 13:00)
        next_monday = now + timedelta(days=(7 - now.weekday()) % 7)
        pending_time = next_monday.replace(hour=9, minute=0, second=0, microsecond=0)
        if pending_time <= now:
            pending_time += timedelta(days=7)
        next_wednesday = now + timedelta(days=(2 - now.weekday()) % 7)
        if next_wednesday <= now:
            next_wednesday += timedelta(days=7)
        approved_time = next_wednesday.replace(hour=13, minute=0, second=0, microsecond=0)

        Appointment.objects.get_or_create(
            doctor=doctor_profile,
            patient=patient_profile,
            start_at=pending_time,
            defaults={
                "symptoms": "Experiencing mild chest discomfort when exercising.",
                "status": Appointment.Status.PENDING,
            },
        )

        Appointment.objects.get_or_create(
            doctor=doctor_profile,
            patient=patient_profile,
            start_at=approved_time,
            defaults={
                "symptoms": "Follow-up appointment for test results.",
                "status": Appointment.Status.APPROVED,
            },
        )

        self.stdout.write(self.style.SUCCESS("Seeding completed."))
