from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_seed_data(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Doctor = apps.get_model("appointments", "Doctor")

    admin_username = "admin"
    if not User.objects.filter(username=admin_username).exists():
        admin_user = User(
            username=admin_username,
            email="",
            is_staff=True,
            is_superuser=True,
            is_active=True,
            password=make_password("admin123"),
        )
        admin_user.save()

    patient_username = "patient1"
    if not User.objects.filter(username=patient_username).exists():
        patient_user = User(
            username=patient_username,
            email="",
            first_name="Pat",
            last_name="Ient",
            is_staff=False,
            is_superuser=False,
            is_active=True,
            password=make_password("patient123"),
        )
        patient_user.save()

    doctors = [
        {
            "name": "Dr. Alice Thompson",
            "specialization": "Cardiology",
            "availability_schedule": "Mon, Wed, Fri - 09:00 to 13:00",
        },
        {
            "name": "Dr. Brian Lee",
            "specialization": "Dermatology",
            "availability_schedule": "Tue, Thu - 10:00 to 16:00",
        },
    ]

    for doctor_data in doctors:
        Doctor.objects.get_or_create(name=doctor_data["name"], defaults=doctor_data)


def remove_seed_data(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Doctor = apps.get_model("appointments", "Doctor")

    User.objects.filter(username__in=["admin", "patient1"]).delete()
    Doctor.objects.filter(name__in=["Dr. Alice Thompson", "Dr. Brian Lee"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("appointments", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_seed_data, remove_seed_data),
    ]
