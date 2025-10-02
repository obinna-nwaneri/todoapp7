from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from appointments.models import Appointment
from doctors.models import Doctor
from patients.models import Patient


class Command(BaseCommand):
    help = 'Seed initial data for the Enterprise Doctor Appointment application.'

    def handle(self, *args, **options):
        admin_user, created = User.objects.update_or_create(
            email='admin@example.com',
            defaults={
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created or not admin_user.has_usable_password():
            admin_user.set_password('admin123')
            admin_user.save()
        self.stdout.write(self.style.SUCCESS('Admin user ensured.'))

        doctor_user, _ = User.objects.update_or_create(
            email='doctor1@example.com',
            defaults={
                'role': User.Role.DOCTOR,
                'is_staff': False,
            },
        )
        if not doctor_user.has_usable_password():
            doctor_user.set_password('doctor123')
            doctor_user.save()

        doctor_profile, _ = Doctor.objects.update_or_create(
            user=doctor_user,
            defaults={
                'name': 'Dr. John Doe',
                'specialization': 'Cardiology',
                'years_of_experience': 10,
                'availability_schedule': {
                    'monday': '09:00-17:00',
                    'wednesday': '10:00-16:00',
                },
            },
        )
        self.stdout.write(self.style.SUCCESS('Doctor profile ensured.'))

        patient_user, _ = User.objects.update_or_create(
            email='patient1@example.com',
            defaults={
                'role': User.Role.PATIENT,
                'is_staff': False,
            },
        )
        if not patient_user.has_usable_password():
            patient_user.set_password('patient123')
            patient_user.save()

        patient_profile, _ = Patient.objects.update_or_create(
            user=patient_user,
            defaults={
                'name': 'Jane Patient',
                'age': 32,
                'gender': 'Female',
                'contact_info': {'phone': '+123456789'},
            },
        )
        self.stdout.write(self.style.SUCCESS('Patient profile ensured.'))

        Appointment.objects.get_or_create(
            doctor=doctor_profile,
            patient=patient_profile,
            date=timezone.now().date() + timedelta(days=1),
            time='10:00',
            defaults={
                'symptoms': 'Experiencing mild chest pains and shortness of breath.',
                'status': Appointment.Status.PENDING,
            },
        )
        Appointment.objects.get_or_create(
            doctor=doctor_profile,
            patient=patient_profile,
            date=timezone.now().date() + timedelta(days=2),
            time='11:30',
            defaults={
                'symptoms': 'Follow-up appointment after recent treatment.',
                'status': Appointment.Status.APPROVED,
            },
        )
        self.stdout.write(self.style.SUCCESS('Sample appointments ensured.'))
