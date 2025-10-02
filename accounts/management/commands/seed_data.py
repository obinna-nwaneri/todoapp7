from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from appointments.models import Appointment, Doctor, Patient


class Command(BaseCommand):
    help = "Seed the database with sample admin, doctor, patient, and appointments."

    @transaction.atomic
    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            email="admin@example.com",
            defaults={
                "username": "admin@example.com",
                "role": User.Roles.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if not admin.check_password("admin123"):
            admin.set_password("admin123")
            admin.save()

        doctor_user, _ = User.objects.get_or_create(
            email="doctor1@example.com",
            defaults={
                "username": "doctor1@example.com",
                "role": User.Roles.DOCTOR,
            },
        )
        if not doctor_user.check_password("doctor123"):
            doctor_user.set_password("doctor123")
            doctor_user.save()
        doctor_profile, _ = Doctor.objects.get_or_create(
            user=doctor_user,
            defaults={
                "name": "Dr. Jane Smith",
                "specialization": "Cardiology",
                "years_of_experience": 10,
                "availability_schedule": "Mon-Fri 09:00-17:00",
            },
        )

        patient_user, _ = User.objects.get_or_create(
            email="patient1@example.com",
            defaults={
                "username": "patient1@example.com",
                "role": User.Roles.PATIENT,
            },
        )
        if not patient_user.check_password("patient123"):
            patient_user.set_password("patient123")
            patient_user.save()
        patient_profile, _ = Patient.objects.get_or_create(
            user=patient_user,
            defaults={
                "name": "John Doe",
                "age": 35,
                "gender": "Male",
                "contact_info": "555-1234",
            },
        )

        today = date.today()
        Appointment.objects.get_or_create(
            patient=patient_profile,
            doctor=doctor_profile,
            date=today + timedelta(days=1),
            time=time(10, 0),
            defaults={"symptoms": "Chest pain", "status": Appointment.Status.PENDING},
        )
        Appointment.objects.get_or_create(
            patient=patient_profile,
            doctor=doctor_profile,
            date=today - timedelta(days=7),
            time=time(14, 30),
            defaults={"symptoms": "Routine check-up", "status": Appointment.Status.COMPLETED},
        )

        self.stdout.write(self.style.SUCCESS("Database seeded with sample data."))
