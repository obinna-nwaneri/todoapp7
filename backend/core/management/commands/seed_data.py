from datetime import date, time

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from core.models import Doctor, Patient, Appointment


class Command(BaseCommand):
    help = "Seed the database with sample admin, doctor, patient, and appointments"

    def handle(self, *args, **options):
        User = get_user_model()

        admin_user, created = User.objects.get_or_create(
            email="admin@example.com",
            defaults={"role": User.Roles.ADMIN, "is_staff": True, "is_superuser": True},
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.first_name = "Admin"
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user."))
        else:
            self.stdout.write("Admin user already exists.")

        doctor_user, created = User.objects.get_or_create(
            email="doctor1@example.com",
            defaults={"role": User.Roles.DOCTOR, "first_name": "John", "last_name": "Doe"},
        )
        if created:
            doctor_user.set_password("doctor123")
            doctor_user.save()
            self.stdout.write(self.style.SUCCESS("Created doctor user."))
        doctor, _ = Doctor.objects.get_or_create(
            user=doctor_user,
            defaults={
                "name": "Dr. John Doe",
                "specialization": "Cardiology",
                "years_of_experience": 8,
                "availability_schedule": "Mon-Fri 9am-5pm",
            },
        )

        patient_user, created = User.objects.get_or_create(
            email="patient1@example.com",
            defaults={"role": User.Roles.PATIENT, "first_name": "Jane", "last_name": "Smith"},
        )
        if created:
            patient_user.set_password("patient123")
            patient_user.save()
            self.stdout.write(self.style.SUCCESS("Created patient user."))
        patient, _ = Patient.objects.get_or_create(
            user=patient_user,
            defaults={"name": "Jane Smith", "age": 30, "gender": "Female", "contact_info": "555-0100"},
        )

        Appointment.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            date=date.today(),
            time=time(10, 0),
            defaults={
                "symptoms": "Chest pain and shortness of breath.",
                "status": Appointment.Status.APPROVED,
            },
        )

        Appointment.objects.get_or_create(
            patient=patient,
            doctor=doctor,
            date=date.today(),
            time=time(14, 0),
            defaults={
                "symptoms": "Routine follow-up.",
                "status": Appointment.Status.PENDING,
            },
        )

        self.stdout.write(self.style.SUCCESS("Database seeded with sample data."))
