from __future__ import annotations

from datetime import date

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models


class User(AbstractUser):
    ROLE_PATIENT = "PATIENT"
    ROLE_DOCTOR = "DOCTOR"
    ROLE_ADMIN = "ADMIN"

    ROLE_CHOICES = (
        (ROLE_PATIENT, "Patient"),
        (ROLE_DOCTOR, "Doctor"),
        (ROLE_ADMIN, "Admin"),
    )

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    preferred_role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default=ROLE_PATIENT
    )

    class Meta:
        ordering = ("username",)

    def __str__(self) -> str:  # pragma: no cover - human readable helper
        return self.get_full_name() or self.username

    @property
    def display_name(self) -> str:
        return self.get_full_name() or self.username

    def is_patient(self) -> bool:
        return self.groups.filter(name=self.ROLE_PATIENT).exists()

    def is_doctor(self) -> bool:
        return self.groups.filter(name=self.ROLE_DOCTOR).exists()

    def is_admin(self) -> bool:
        return self.is_staff or self.groups.filter(name=self.ROLE_ADMIN).exists()


class PatientProfile(models.Model):
    GENDER_CHOICES = (
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    dob = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)

    class Meta:
        ordering = ("user__last_name", "user__first_name")

    def __str__(self) -> str:  # pragma: no cover - human readable helper
        return f"Patient profile for {self.user.display_name}"

    @property
    def age(self) -> int | None:
        if not self.dob:
            return None
        today = date.today()
        return today.year - self.dob.year - (
            (today.month, today.day) < (self.dob.month, self.dob.day)
        )


class DoctorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    specialty = models.ForeignKey(
        "directory.Specialty",
        on_delete=models.PROTECT,
        related_name="doctors",
    )
    years_experience = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=255)
    fee = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    bio = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    available_for_virtual = models.BooleanField(default=True)

    class Meta:
        ordering = ("user__last_name", "user__first_name")

    def __str__(self) -> str:  # pragma: no cover
        return f"Dr. {self.user.get_full_name()}"

    @property
    def is_verified(self) -> bool:
        return self.verified

    @property
    def next_available_slot(self):
        from scheduling.services import AvailabilityService

        service = AvailabilityService(self.user)
        slots = service.upcoming_slots(limit=1)
        return slots[0] if slots else None

    def total_patients_seen(self) -> int:
        return (
            self.user.doctor_appointments.filter(status="COMPLETED")
            .values("patient")
            .distinct()
            .count()
        )

    def mark_verified(self, actor: User | None = None) -> None:
        self.verified = True
        self.save(update_fields=["verified"])
        if actor:
            from core.models import AuditLog

            AuditLog.objects.create(
                admin=actor,
                action="doctor_verified",
                entity="DoctorProfile",
                entity_id=self.pk,
                meta={"doctor": self.user_id},
            )
