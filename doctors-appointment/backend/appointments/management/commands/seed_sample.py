from __future__ import annotations

from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from appointments.models import Appointment, Availability, Doctor, Patient, Profile, Specialty

PASSWORD = "Passw0rd!"


class Command(BaseCommand):
    help = "Seed database with sample doctors, patients, and appointments"

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write(self.style.WARNING("Seeding sample data..."))
            specialties = self._seed_specialties()
            doctors = self._seed_doctors(specialties)
            patients = self._seed_patients()
            self._seed_appointments(doctors, patients)
        self._print_summary(doctors, patients)
        self.stdout.write(self.style.SUCCESS("Seeding complete."))

    def _seed_specialties(self):
        mapping = {}
        for name in ["Cardiology", "Dermatology", "Pediatrics"]:
            specialty, _ = Specialty.objects.get_or_create(name=name)
            mapping[name] = specialty
        return mapping

    def _create_user(self, username: str, first_name: str, last_name: str, email: str, role: str, phone: str):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
            },
        )
        if created:
            user.set_password(PASSWORD)
            user.save()
        profile, _ = Profile.objects.get_or_create(user=user, defaults={"role": role, "phone": phone})
        if profile.role != role:
            profile.role = role
            profile.phone = phone
            profile.save()
        else:
            profile.phone = phone
            profile.save(update_fields=["phone"])
        return user

    def _seed_doctors(self, specialties):
        doctors = {}
        doctor_data = [
            (
                "dr_adebayo",
                "Kunle",
                "Adebayo",
                "kunle.adebayo@example.com",
                specialties["Cardiology"],
                "Lagos Heart Clinic",
                "Experienced cardiologist specializing in heart health and wellness.",
                "25000.00",
            ),
            (
                "dr_okafor",
                "Adaeze",
                "Okafor",
                "adaeze.okafor@example.com",
                specialties["Dermatology"],
                "SkinCare Abuja",
                "Dermatologist with a focus on medical and cosmetic skin care.",
                "18000.00",
            ),
            (
                "dr_bello",
                "Ibrahim",
                "Bello",
                "ibrahim.bello@example.com",
                specialties["Pediatrics"],
                "Rivers Kids Health",
                "Pediatrician dedicated to children's wellness and preventive care.",
                "15000.00",
            ),
        ]

        for username, first_name, last_name, email, specialty, clinic, about, fee in doctor_data:
            user = self._create_user(username, first_name, last_name, email, Profile.Role.DOCTOR, phone="08000000000")
            doctor, _ = Doctor.objects.get_or_create(
                user=user,
                defaults={
                    "specialty": specialty,
                    "clinic_name": clinic,
                    "about": about,
                    "consultation_fee": fee,
                    "is_active": True,
                },
            )
            doctors[username] = doctor
            self._seed_availability(doctor)
        return doctors

    def _seed_availability(self, doctor: Doctor) -> None:
        Availability.objects.filter(doctor=doctor).delete()
        morning_start = time(hour=9, minute=0)
        morning_end = time(hour=12, minute=0)
        afternoon_start = time(hour=13, minute=0)
        afternoon_end = time(hour=16, minute=0)

        for weekday in range(5):  # Monday to Friday
            Availability.objects.get_or_create(
                doctor=doctor,
                weekday=weekday,
                start_time=morning_start,
                end_time=morning_end,
                defaults={"slot_minutes": 30},
            )
            Availability.objects.get_or_create(
                doctor=doctor,
                weekday=weekday,
                start_time=afternoon_start,
                end_time=afternoon_end,
                defaults={"slot_minutes": 30},
            )

    def _seed_patients(self):
        patients = {}
        patient_data = [
            ("patient_tolu", "Tolu", "Alade", "tolu.alade@example.com", "1995-03-12"),
            ("patient_chioma", "Chioma", "Eze", "chioma.eze@example.com", "1992-07-21"),
            ("patient_segun", "Segun", "Akin", "segun.akin@example.com", "1988-11-02"),
            ("patient_fatima", "Fatima", "Musa", "fatima.musa@example.com", "1999-01-18"),
            ("patient_emeka", "Emeka", "Obi", "emeka.obi@example.com", "1990-05-05"),
        ]
        for username, first_name, last_name, email, dob in patient_data:
            dob_value = timezone.datetime.strptime(dob, "%Y-%m-%d").date()
            user = self._create_user(username, first_name, last_name, email, Profile.Role.PATIENT, phone="08011111111")
            patient, _ = Patient.objects.get_or_create(user=user, defaults={"dob": dob_value})
            if patient.dob != dob_value:
                patient.dob = dob_value
                patient.save(update_fields=["dob"])
            patients[username] = patient
        return patients

    def _seed_appointments(self, doctors, patients):
        Appointment.objects.all().delete()
        today = timezone.localdate()

        schedule = [
            (today + timedelta(days=1), "dr_adebayo", "patient_tolu", time(9, 0), time(9, 30), Appointment.Status.PENDING),
            (today + timedelta(days=1), "dr_okafor", "patient_chioma", time(10, 0), time(10, 30), Appointment.Status.CONFIRMED),
            (today + timedelta(days=2), "dr_bello", "patient_segun", time(13, 0), time(13, 30), Appointment.Status.PENDING),
            (today + timedelta(days=2), "dr_bello", "patient_fatima", time(14, 0), time(14, 30), Appointment.Status.CANCELLED),
            (today + timedelta(days=5), "dr_okafor", "patient_emeka", time(9, 30), time(10, 0), Appointment.Status.CONFIRMED),
            (today - timedelta(days=1), "dr_adebayo", "patient_chioma", time(11, 0), time(11, 30), Appointment.Status.COMPLETED),
            (today - timedelta(days=1), "dr_bello", "patient_tolu", time(15, 0), time(15, 30), Appointment.Status.COMPLETED),
            (today + timedelta(days=10), "dr_adebayo", "patient_emeka", time(13, 30), time(14, 0), Appointment.Status.PENDING),
        ]

        for date_value, doctor_key, patient_key, start, end, status_value in schedule:
            doctor = doctors[doctor_key]
            patient = patients[patient_key]
            adjusted_date = self._adjust_date_for_availability(doctor, date_value, today)
            temp_date = date_value if date_value >= today else today
            appointment = Appointment.objects.create(
                doctor=doctor,
                patient=patient,
                date=temp_date if temp_date >= today else adjusted_date,
                start_time=start,
                end_time=end,
                status=status_value,
            )
            if date_value < today:
                Appointment.objects.filter(pk=appointment.pk).update(date=adjusted_date)
            elif adjusted_date != date_value:
                Appointment.objects.filter(pk=appointment.pk).update(date=adjusted_date)

    def _adjust_date_for_availability(self, doctor: Doctor, target_date, today):
        availability_weekdays = set(doctor.availabilities.values_list("weekday", flat=True))
        if not availability_weekdays:
            return target_date
        adjusted = target_date
        if doctor.availabilities.filter(weekday=adjusted.weekday()).exists():
            return adjusted
        if adjusted >= today:
            while adjusted.weekday() not in availability_weekdays:
                adjusted += timedelta(days=1)
        else:
            while adjusted.weekday() not in availability_weekdays:
                adjusted -= timedelta(days=1)
        return adjusted

    def _print_summary(self, doctors, patients):
        self.stdout.write("\nSeeded users (username - role):")
        for username, doctor in doctors.items():
            self.stdout.write(f"  {username} - DOCTOR")
        for username in patients:
            self.stdout.write(f"  {username} - PATIENT")
        self.stdout.write("\nAll seeded users share the password: Passw0rd!\n")
