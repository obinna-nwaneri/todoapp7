from django.contrib.auth import get_user_model
from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .models import Doctor

User = get_user_model()


@receiver(post_migrate)
def create_seed_data(sender, **kwargs):
    if sender.name != "appointments":
        return

    admin_email = "admin@example.com"
    patient_email = "user@example.com"

    admin_defaults = {
        "first_name": "Admin",
        "last_name": "User",
        "is_staff": True,
        "is_superuser": True,
    }
    admin_user, created = User.objects.get_or_create(email=admin_email, defaults=admin_defaults)
    if created or not admin_user.check_password("admin123"):
        admin_user.set_password("admin123")
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

    patient_defaults = {"first_name": "Sample", "last_name": "Patient"}
    patient_user, created = User.objects.get_or_create(email=patient_email, defaults=patient_defaults)
    if created or not patient_user.check_password("user123"):
        patient_user.set_password("user123")
        patient_user.save()

    doctors = [
        {"name": "Dr. Alice Smith", "specialization": "Cardiology", "availability_schedule": "Mon-Fri 9:00 AM - 1:00 PM"},
        {"name": "Dr. Bob Johnson", "specialization": "Dermatology", "availability_schedule": "Tue-Thu 2:00 PM - 6:00 PM"},
    ]
    for doctor_data in doctors:
        Doctor.objects.get_or_create(name=doctor_data["name"], defaults=doctor_data)
