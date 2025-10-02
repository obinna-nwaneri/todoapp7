from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "ADMIN", _("Admin")
        DOCTOR = "DOCTOR", _("Doctor")
        PATIENT = "PATIENT", _("Patient")

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.PATIENT)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self) -> str:
        return f"{self.get_full_name() or self.email} ({self.role})"


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    years_of_experience = models.PositiveIntegerField(default=0)
    availability_schedule = models.TextField(help_text=_("Describe weekly availability schedule."))

    def __str__(self) -> str:
        return f"{self.name} - {self.specialization}"


class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_profile")
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    contact_info = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.name


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending", _("Pending")
        APPROVED = "Approved", _("Approved")
        REJECTED = "Rejected", _("Rejected")
        COMPLETED = "Completed", _("Completed")

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    date = models.DateField()
    time = models.TimeField()
    symptoms = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-time"]

    def __str__(self) -> str:
        return f"{self.patient.name} with {self.doctor.name} on {self.date}"
