from __future__ import annotations

from datetime import datetime, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from appointments.models import ActivityLog, Appointment, Clinic, DoctorProfile, Specialty, WeeklyAvailability
from appointments.services import log_activity

User = get_user_model()


class Command(BaseCommand):
    help = "Seed sample data for the MedBook doctor appointment system"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Creating specialties"))
        specialties = [
            "Cardiology",
            "Dermatology",
            "Pediatrics",
            "General Medicine",
            "Neurology",
        ]
        specialty_objects = {}
        for name in specialties:
            specialty, _ = Specialty.objects.get_or_create(name=name)
            specialty_objects[name] = specialty
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(specialty_objects)} specialties"))

        self.stdout.write(self.style.MIGRATE_HEADING("Creating clinics"))
        clinic, _ = Clinic.objects.get_or_create(
            name="MedBook Specialist Hospital",
            defaults={
                "address": "12 Care Street",
                "city": "Lagos",
                "state": "Lagos",
                "phone": "+234 800 000 0000",
            },
        )
        self.stdout.write(self.style.SUCCESS("Clinic ready"))

        self.stdout.write(self.style.MIGRATE_HEADING("Creating users"))
        users_data = [
            {
                "username": "drstrange",
                "email": "doctor@example.com",
                "first_name": "Stephen",
                "last_name": "Strange",
                "password": "pass1234",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "drhouse",
                "email": "gregory@example.com",
                "first_name": "Gregory",
                "last_name": "House",
                "password": "pass1234",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "patientjane",
                "email": "jane@example.com",
                "first_name": "Jane",
                "last_name": "Doe",
                "password": "pass1234",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "patientjohn",
                "email": "john@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "password": "pass1234",
                "is_staff": False,
                "is_superuser": False,
            },
            {
                "username": "medadmin",
                "email": "admin@example.com",
                "first_name": "Ada",
                "last_name": "Admin",
                "password": "admin1234",
                "is_staff": True,
                "is_superuser": True,
            },
        ]

        created_users = {}
        for data in users_data:
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "is_staff": data["is_staff"],
                    "is_superuser": data["is_superuser"],
                },
            )
            if created:
                user.set_password(data["password"])
                user.save()
            created_users[data["username"]] = user
        self.stdout.write(self.style.SUCCESS(f"Prepared {len(created_users)} users"))

        self.stdout.write(self.style.MIGRATE_HEADING("Configuring doctor profiles"))
        doctor_profiles = []
        doctor_specs = {
            "drstrange": "Neurology",
            "drhouse": "General Medicine",
        }
        for username, specialty_name in doctor_specs.items():
            user = created_users[username]
            doctor_profile, _ = DoctorProfile.objects.get_or_create(
                user=user,
                defaults={
                    "specialty": specialty_objects[specialty_name],
                    "clinic": clinic,
                    "bio": "Experienced specialist dedicated to patient wellbeing.",
                    "fee": 15000,
                    "slot_length_minutes": 30,
                    "is_active": True,
                },
            )
            if doctor_profile.specialty_id != specialty_objects[specialty_name].id:
                doctor_profile.specialty = specialty_objects[specialty_name]
                doctor_profile.clinic = clinic
                doctor_profile.is_active = True
                doctor_profile.save()
            doctor_profiles.append(doctor_profile)
        self.stdout.write(self.style.SUCCESS(f"Configured {len(doctor_profiles)} doctor profiles"))

        self.stdout.write(self.style.MIGRATE_HEADING("Creating weekly availability"))
        availability_templates = [
            (0, time(9, 0), time(12, 0)),
            (2, time(13, 0), time(17, 0)),
            (4, time(9, 0), time(14, 0)),
        ]
        for profile in doctor_profiles:
            for weekday, start_time, end_time in availability_templates:
                WeeklyAvailability.objects.get_or_create(
                    doctor=profile,
                    weekday=weekday,
                    start_time=start_time,
                    end_time=end_time,
                )
        self.stdout.write(self.style.SUCCESS("Availability set"))

        self.stdout.write(self.style.MIGRATE_HEADING("Creating sample appointments"))
        tz = timezone.get_current_timezone()
        start_day = timezone.localdate() + timedelta(days=1)
        appointment_specs = [
            {
                "patient": created_users["patientjane"],
                "doctor": created_users["drstrange"],
                "start": datetime.combine(start_day, time(9, 0)),
                "status": Appointment.STATUS_PENDING,
                "reason": "Migraine consultation",
            },
            {
                "patient": created_users["patientjohn"],
                "doctor": created_users["drhouse"],
                "start": datetime.combine(start_day + timedelta(days=1), time(13, 0)),
                "status": Appointment.STATUS_APPROVED,
                "reason": "General checkup",
            },
        ]

        for spec in appointment_specs:
            start = spec["start"]
            if timezone.is_naive(start):
                start = timezone.make_aware(start, tz)
            doctor_profile = spec["doctor"].doctor_profile
            slot_length = doctor_profile.slot_length_minutes or 30
            end = start + timedelta(minutes=slot_length)
            appointment, created = Appointment.objects.get_or_create(
                patient=spec["patient"],
                doctor=spec["doctor"],
                start=start,
                defaults={
                    "end": end,
                    "status": spec["status"],
                    "reason": spec["reason"],
                },
            )
            if created:
                log_activity(
                    spec["patient"],
                    "appointment_created",
                    appointment,
                    extra={"status": appointment.status},
                )
            else:
                appointment.end = end
                appointment.status = spec["status"]
                appointment.reason = spec["reason"]
                appointment.save()
        self.stdout.write(self.style.SUCCESS("Appointments ready"))

        self.stdout.write(self.style.MIGRATE_HEADING("Ensuring admin user activity log"))
        admin_user = created_users["medadmin"]
        ActivityLog.objects.get_or_create(
            actor=admin_user,
            action="seed_data_loaded",
            model="System",
            object_id="seed",
            defaults={"extra": {"message": "Sample data installed"}},
        )
        self.stdout.write(self.style.SUCCESS("Sample data seeding completed."))
