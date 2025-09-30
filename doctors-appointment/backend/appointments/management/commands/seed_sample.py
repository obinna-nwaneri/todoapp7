from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from appointments.models import Appointment, Availability, Doctor, Patient, Profile, Specialty


class Command(BaseCommand):
    help = "Seed sample data for the Doctor's Appointment System."

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write("Seeding sample data...")
            specialties = self._create_specialties()
            doctors = self._create_doctors(specialties)
            patients = self._create_patients()
            self._create_availabilities(doctors)
            self._create_appointments(doctors, patients)
            self.stdout.write(self.style.SUCCESS("Sample data seeding complete."))

    def _create_specialties(self):
        specialty_names = ["Cardiology", "Dermatology", "Pediatrics"]
        specialties = {}
        for name in specialty_names:
            specialty, _ = Specialty.objects.get_or_create(
                name=name,
                defaults={"slug": slugify(name)},
            )
            specialties[name] = specialty
        return specialties

    def _create_doctors(self, specialties):
        doctor_configs = [
            {
                "username": "dr_adebayo",
                "first_name": "Kunle",
                "last_name": "Adebayo",
                "specialty": specialties["Cardiology"],
                "clinic_name": "Lagos Heart Clinic",
                "about": "Experienced cardiologist with focus on preventive care.",
                "fee": "25000.00",
                "phone": "+234800000001",
            },
            {
                "username": "dr_okafor",
                "first_name": "Adaeze",
                "last_name": "Okafor",
                "specialty": specialties["Dermatology"],
                "clinic_name": "SkinCare Abuja",
                "about": "Dermatologist specializing in chronic skin conditions.",
                "fee": "18000.00",
                "phone": "+234800000002",
            },
            {
                "username": "dr_bello",
                "first_name": "Ibrahim",
                "last_name": "Bello",
                "specialty": specialties["Pediatrics"],
                "clinic_name": "Rivers Kids Health",
                "about": "Pediatrician caring for children of all ages.",
                "fee": "15000.00",
                "phone": "+234800000003",
            },
        ]
        doctors = {}
        for config in doctor_configs:
            user, created = User.objects.get_or_create(
                username=config["username"],
                defaults={
                    "first_name": config["first_name"],
                    "last_name": config["last_name"],
                    "email": f"{config['username']}@example.com",
                },
            )
            if created:
                user.set_password("password123")
                user.save()
            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={"role": Profile.Role.DOCTOR, "phone": config["phone"]},
            )
            if profile.role != Profile.Role.DOCTOR:
                profile.role = Profile.Role.DOCTOR
                profile.phone = config["phone"]
                profile.save()
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "specialty": config["specialty"],
                    "clinic_name": config["clinic_name"],
                    "about": config["about"],
                    "consultation_fee": config["fee"],
                    "is_active": True,
                },
            )
            doctors[config["username"]] = doctor
        return doctors

    def _create_patients(self):
        patient_configs = [
            ("patient_tolu", "Tolu", "Alade", date(1995, 3, 12)),
            ("patient_chioma", "Chioma", "Eze", date(1992, 7, 21)),
            ("patient_segun", "Segun", "Akin", date(1988, 11, 2)),
            ("patient_fatima", "Fatima", "Musa", date(1999, 1, 18)),
            ("patient_emeka", "Emeka", "Obi", date(1990, 5, 5)),
        ]
        patients = {}
        for username, first_name, last_name, dob in patient_configs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": f"{username}@example.com",
                },
            )
            if created:
                user.set_password("password123")
                user.save()
            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={"role": Profile.Role.PATIENT, "phone": "+234900000000"},
            )
            if profile.role != Profile.Role.PATIENT:
                profile.role = Profile.Role.PATIENT
                profile.save()
            patient, _ = Patient.objects.get_or_create(
                user=user,
                defaults={"dob": dob, "address": ""},
            )
            patients[username] = patient
        return patients

    def _create_availabilities(self, doctors):
        schedules = [
            (time(9, 0), time(12, 0)),
            (time(13, 0), time(16, 0)),
        ]
        for doctor in doctors.values():
            for weekday in range(5):  # Monday to Friday
                for start, end in schedules:
                    Availability.objects.get_or_create(
                        doctor=doctor,
                        weekday=weekday,
                        start_time=start,
                        end_time=end,
                        defaults={"slot_minutes": 30},
                    )

    def _create_appointments(self, doctors, patients):
        today = timezone.localdate()
        def ensure_weekday(target_date, direction):
            while target_date.weekday() >= 5:
                target_date += timedelta(days=direction)
            return target_date

        appointments_data = [
            (ensure_weekday(today - timedelta(days=1), -1), "dr_adebayo", "patient_chioma", time(11, 0), time(11, 30), Appointment.Status.COMPLETED),
            (ensure_weekday(today + timedelta(days=1), 1), "dr_adebayo", "patient_tolu", time(9, 0), time(9, 30), Appointment.Status.PENDING),
            (ensure_weekday(today + timedelta(days=10), 1), "dr_adebayo", "patient_emeka", time(13, 30), time(14, 0), Appointment.Status.PENDING),
            (ensure_weekday(today + timedelta(days=1), 1), "dr_okafor", "patient_chioma", time(10, 0), time(10, 30), Appointment.Status.CONFIRMED),
            (ensure_weekday(today + timedelta(days=5), 1), "dr_okafor", "patient_emeka", time(9, 30), time(10, 0), Appointment.Status.CONFIRMED),
            (ensure_weekday(today + timedelta(days=2), 1), "dr_bello", "patient_segun", time(13, 0), time(13, 30), Appointment.Status.PENDING),
            (ensure_weekday(today + timedelta(days=2), 1), "dr_bello", "patient_fatima", time(14, 0), time(14, 30), Appointment.Status.CANCELLED),
            (ensure_weekday(today - timedelta(days=1), -1), "dr_bello", "patient_tolu", time(15, 0), time(15, 30), Appointment.Status.COMPLETED),
        ]
        for appointment_date, doctor_key, patient_key, start, end, status_value in appointments_data:
            doctor = doctors[doctor_key]
            patient = patients[patient_key]
            appointment, created = Appointment.objects.get_or_create(
                doctor=doctor,
                patient=patient,
                date=appointment_date,
                start_time=start,
                defaults={"end_time": end, "status": status_value},
            )
            if not created:
                appointment.end_time = end
                appointment.status = status_value
            appointment.full_clean()
            appointment.save()
        # additional completed appointment already added for dr_bello above
