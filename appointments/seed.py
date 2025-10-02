from datetime import date, time, timedelta

from django.contrib.auth import get_user_model

from accounts.views import ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT
from .models import Appointment, Doctor, Patient
from .utils import assign_role, ensure_group


def ensure_seed_data():
    User = get_user_model()

    ensure_group(ROLE_ADMIN)
    ensure_group(ROLE_DOCTOR)
    ensure_group(ROLE_PATIENT)

    admin, _ = User.objects.get_or_create(
        username="admin",
        defaults={"is_staff": True, "is_superuser": True, "email": "admin@example.com"},
    )
    if not admin.check_password("admin123"):
        admin.set_password("admin123")
        admin.save()

    doctor_user, _ = User.objects.get_or_create(
        username="doctor1",
        defaults={"is_staff": True, "first_name": "Alice", "last_name": "Anderson"},
    )
    if not doctor_user.check_password("doctor123"):
        doctor_user.set_password("doctor123")
        doctor_user.save()
    assign_role(doctor_user, ROLE_DOCTOR)

    patient_user, _ = User.objects.get_or_create(
        username="patient1",
        defaults={"first_name": "Bob", "last_name": "Brown"},
    )
    if not patient_user.check_password("patient123"):
        patient_user.set_password("patient123")
        patient_user.save()
    assign_role(patient_user, ROLE_PATIENT)

    doctor_profile, _ = Doctor.objects.get_or_create(
        user=doctor_user,
        defaults={
            "name": "Dr. Alice Anderson",
            "specialization": "General Medicine",
            "availability_schedule": "Mon-Fri: 9:00 AM - 4:00 PM",
        },
    )

    patient_profile, _ = Patient.objects.get_or_create(
        user=patient_user,
        defaults={
            "name": "Bob Brown",
            "age": 34,
            "gender": "male",
            "contact_info": "bob.brown@example.com",
        },
    )

    base_date = date.today()
    sample_times = [time(hour=10, minute=0), time(hour=13, minute=30), time(hour=15, minute=0)]
    statuses = [
        Appointment.STATUS_PENDING,
        Appointment.STATUS_APPROVED,
        Appointment.STATUS_COMPLETED,
    ]

    for idx, status in enumerate(statuses):
        appointment_date = base_date + timedelta(days=idx)
        appointment_time = sample_times[idx % len(sample_times)]
        Appointment.objects.get_or_create(
            patient=patient_profile,
            doctor=doctor_profile,
            date=appointment_date,
            time=appointment_time,
            defaults={
                "symptoms": "Follow-up consultation for general health check.",
                "status": status,
            },
        )
