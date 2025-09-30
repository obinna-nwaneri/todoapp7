from __future__ import annotations

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Profile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(choices=[("ADMIN", "Admin"), ("DOCTOR", "Doctor"), ("PATIENT", "Patient")], max_length=20)),
                ("phone", models.CharField(max_length=20)),
                ("gender", models.CharField(blank=True, max_length=20)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="profile", to="auth.user")),
            ],
        ),
        migrations.CreateModel(
            name="Specialty",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120, unique=True)),
                ("slug", models.SlugField(max_length=140, unique=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Doctor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("clinic_name", models.CharField(max_length=255)),
                ("about", models.TextField()),
                ("consultation_fee", models.DecimalField(decimal_places=2, max_digits=10)),
                ("is_active", models.BooleanField(default=True)),
                ("specialty", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="doctors", to="appointments.specialty")),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="doctor_profile", to="auth.user")),
            ],
            options={"ordering": ["user__last_name", "user__first_name"]},
        ),
        migrations.CreateModel(
            name="Patient",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("dob", models.DateField()),
                ("address", models.TextField(blank=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="patient_profile", to="auth.user")),
            ],
            options={"ordering": ["user__last_name", "user__first_name"]},
        ),
        migrations.CreateModel(
            name="Availability",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("weekday", models.PositiveSmallIntegerField(help_text="0=Mon .. 6=Sun")),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("slot_minutes", models.PositiveIntegerField(default=30)),
                ("doctor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="availabilities", to="appointments.doctor")),
            ],
            options={"ordering": ["doctor", "weekday", "start_time"]},
        ),
        migrations.CreateModel(
            name="Appointment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField()),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("reason", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("CONFIRMED", "Confirmed"), ("CANCELLED", "Cancelled"), ("COMPLETED", "Completed")], default="PENDING", max_length=20)),
                ("doctor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="appointments", to="appointments.doctor")),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="appointments", to="appointments.patient")),
            ],
            options={"ordering": ["-date", "start_time"]},
        ),
        migrations.AddConstraint(
            model_name="availability",
            constraint=models.UniqueConstraint(fields=("doctor", "weekday", "start_time", "end_time"), name="unique_availability_slot"),
        ),
        migrations.AddConstraint(
            model_name="appointment",
            constraint=models.UniqueConstraint(fields=("doctor", "date", "start_time"), name="unique_doctor_appointment_start"),
        ),
    ]
