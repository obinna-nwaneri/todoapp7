from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    patient = models.ForeignKey("patients.Patient", on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey("doctors.Doctor", on_delete=models.CASCADE, related_name="appointments")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(blank=True, null=True)
    symptoms = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-start_at",)
        constraints = [
            models.UniqueConstraint(fields=["doctor", "start_at"], name="unique_doctor_slot"),
        ]

    def clean(self) -> None:
        if self.start_at < timezone.now() - timedelta(minutes=1):
            raise ValidationError("Appointments cannot start in the past")
        if not self.symptoms or len(self.symptoms.strip()) < 10:
            raise ValidationError("Symptoms must be provided with at least 10 characters")

    def save(self, *args, **kwargs):
        if not self.end_at:
            duration_minutes = getattr(settings, "DEFAULT_APPOINTMENT_DURATION_MINUTES", 30)
            self.end_at = self.start_at + timedelta(minutes=duration_minutes)
        super().save(*args, **kwargs)

    @property
    def is_pending(self) -> bool:
        return self.status == self.Status.PENDING

    @property
    def is_future(self) -> bool:
        return self.start_at >= timezone.now()

    def __str__(self) -> str:  # pragma: no cover
        return f"Appointment {self.patient} with {self.doctor} on {self.start_at}"
