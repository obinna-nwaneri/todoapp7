from django.contrib.auth.hashers import make_password
from django.db import migrations


def seed_data(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Doctor = apps.get_model("appointments", "Doctor")

    admin_email = "admin@example.com"
    patient_email = "user@example.com"

    admin_user, _ = User.objects.get_or_create(
        username=admin_email,
        defaults={
            "email": admin_email,
            "is_staff": True,
            "is_superuser": True,
            "password": make_password("admin123"),
            "first_name": "Admin",
            "last_name": "User",
        },
    )
    if not admin_user.is_superuser or not admin_user.is_staff:
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.password = make_password("admin123")
        admin_user.save()

    patient_user, _ = User.objects.get_or_create(
        username=patient_email,
        defaults={
            "email": patient_email,
            "password": make_password("user123"),
            "first_name": "Jane",
            "last_name": "Doe",
        },
    )
    if patient_user.email != patient_email:
        patient_user.email = patient_email
        patient_user.save(update_fields=["email"])

    Doctor.objects.get_or_create(
        name="Dr. Emily Carter",
        defaults={
            "specialization": "Cardiology",
            "availability_schedule": "Mon-Fri: 9:00 AM - 3:00 PM",
        },
    )
    Doctor.objects.get_or_create(
        name="Dr. Liam Nguyen",
        defaults={
            "specialization": "Dermatology",
            "availability_schedule": "Tue-Thu: 11:00 AM - 6:00 PM",
        },
    )


def unseed_data(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Doctor = apps.get_model("appointments", "Doctor")

    User.objects.filter(email__in=["admin@example.com", "user@example.com"]).delete()
    Doctor.objects.filter(name__in=["Dr. Emily Carter", "Dr. Liam Nguyen"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("appointments", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_data, reverse_code=unseed_data),
    ]
