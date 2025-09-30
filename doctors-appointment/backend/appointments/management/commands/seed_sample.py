"""Seed the database with sample doctors, patients, and appointments."""
from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from appointments.models import Appointment, Availability, Doctor, Patient, Profile, Specialty

User = get_user_model()
PASSWORD = "Passw0rd!"


class Command(BaseCommand):
    help = "Seed the database with demo data for the doctor's appointment system."

    def handle(self, *args, **options):  # type: ignore[override]
        with transaction.atomic():
            specialties = self._seed_specialties()
            doctors = self._seed_doctors(specialties)
            patients = self._seed_patients()
            self._seed_availability(doctors)
            self._seed_appointments(doctors, patients)
        self.stdout.write(self.style.SUCCESS("Sample data created."))
        self.stdout.write("Default password for all users: Passw0rd!")
        self.stdout.write("Doctors: dr_adebayo, dr_okafor, dr_bello")
        self.stdout.write("Patients: patient_tolu, patient_chioma, patient_segun, patient_fatima, patient_emeka")

    def _seed_specialties(self) -> dict[str, Specialty]:
        specialties: dict[str, Specialty] = {}
        for name in ["Cardiology", "Dermatology", "Pediatrics"]:
            specialty, _ = Specialty.objects.get_or_create(name=name)
            specialties[name] = specialty
        return specialties

    def _create_user_with_profile(self, username: str, *, role: str, first_name: str = "", last_name: str = "", email: str = "") -> User:
        user, created = User.objects.get_or_create(username=username, defaults={"first_name": first_name, "last_name": last_name, "email": email})
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
        user.set_password(PASSWORD)
        user.save()
        Profile.objects.update_or_create(user=user, defaults={"role": role})
        return user

    def _seed_doctors(self, specialties: dict[str, Specialty]) -> dict[str, Doctor]:
        doctor_data = {
            "dr_adebayo": {
                "first_name": "Kunle",
                "last_name": "Adebayo",
                "specialty": specialties["Cardiology"],
                "clinic_name": "Lagos Heart Clinic",
                "about": "Experienced cardiologist focused on preventative care.",
                "fee": "25000.00",
            },
            "dr_okafor": {
                "first_name": "Adaeze",
                "last_name": "Okafor",
                "specialty": specialties["Dermatology"],
                "clinic_name": "SkinCare Abuja",
                "about": "Dermatologist helping patients with chronic skin conditions.",
                "fee": "18000.00",
            },
            "dr_bello": {
                "first_name": "Ibrahim",
                "last_name": "Bello",
                "specialty": specialties["Pediatrics"],
                "clinic_name": "Rivers Kids Health",
                "about": "Pediatrician passionate about community health.",
                "fee": "15000.00",
            },
        }
        doctors: dict[str, Doctor] = {}
        for username, data in doctor_data.items():
            user = self._create_user_with_profile(
                username,
                role=Profile.Role.DOCTOR,
                first_name=data["first_name"],
                last_name=data["last_name"],
            )
            doctor, _ = Doctor.objects.update_or_create(
                user=user,
                defaults={
                    "specialty": data["specialty"],
                    "clinic_name": data["clinic_name"],
                    "about": data["about"],
                    "consultation_fee": data["fee"],
                    "is_active": True,
                },
            )
            doctors[username] = doctor
        return doctors

    def _seed_patients(self) -> dict[str, Patient]:
        patient_data = {
            "patient_tolu": {"first_name": "Tolu", "last_name": "Alade", "dob": date(1995, 3, 12)},
            "patient_chioma": {"first_name": "Chioma", "last_name": "Eze", "dob": date(1992, 7, 21)},
            "patient_segun": {"first_name": "Segun", "last_name": "Akin", "dob": date(1988, 11, 2)},
            "patient_fatima": {"first_name": "Fatima", "last_name": "Musa", "dob": date(1999, 1, 18)},
            "patient_emeka": {"first_name": "Emeka", "last_name": "Obi", "dob": date(1990, 5, 5)},
        }
        patients: dict[str, Patient] = {}
        for username, data in patient_data.items():
            user = self._create_user_with_profile(
                username,
                role=Profile.Role.PATIENT,
                first_name=data["first_name"],
                last_name=data["last_name"],
            )
            patient, _ = Patient.objects.update_or_create(user=user, defaults={"dob": data["dob"]})
            patients[username] = patient
        return patients

    def _seed_availability(self, doctors: dict[str, Doctor]) -> None:
        morning_start = time(9, 0)
        morning_end = time(12, 0)
        afternoon_start = time(13, 0)
        afternoon_end = time(16, 0)
        weekdays = range(5)  # Monday to Friday
        for doctor in doctors.values():
            doctor.availabilities.all().delete()
            for weekday in weekdays:
                Availability.objects.update_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time=morning_start,
                    defaults={"end_time": morning_end, "slot_minutes": 30},
                )
                Availability.objects.update_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time=afternoon_start,
                    defaults={"end_time": afternoon_end, "slot_minutes": 30},
                )

    def _seed_appointments(self, doctors: dict[str, Doctor], patients: dict[str, Patient]) -> None:
        today = timezone.localdate()
        schedule = [
            (1, "dr_adebayo", "patient_tolu", time(9, 0), time(9, 30), Appointment.Status.PENDING),
            (1, "dr_okafor", "patient_chioma", time(10, 0), time(10, 30), Appointment.Status.CONFIRMED),
            (2, "dr_bello", "patient_segun", time(13, 0), time(13, 30), Appointment.Status.PENDING),
            (2, "dr_bello", "patient_fatima", time(14, 0), time(14, 30), Appointment.Status.CANCELLED),
            (5, "dr_okafor", "patient_emeka", time(9, 30), time(10, 0), Appointment.Status.CONFIRMED),
            (-1, "dr_adebayo", "patient_chioma", time(11, 0), time(11, 30), Appointment.Status.COMPLETED),
            (-1, "dr_bello", "patient_tolu", time(15, 0), time(15, 30), Appointment.Status.COMPLETED),
            (10, "dr_adebayo", "patient_emeka", time(13, 30), time(14, 0), Appointment.Status.PENDING),
        ]
        for offset, doctor_key, patient_key, start, end, status in schedule:
            appointment_date = today + timedelta(days=offset)
            doctor = doctors[doctor_key]
            patient = patients[patient_key]
            Appointment.objects.update_or_create(
                doctor=doctor,
                date=appointment_date,
                start_time=start,
                defaults={
                    "patient": patient,
                    "end_time": end,
                    "status": status,
                },
            )
