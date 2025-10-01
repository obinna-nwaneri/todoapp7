from __future__ import annotations

from datetime import datetime, timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

STATUS_CHOICES = (
    ("PENDING", "Pending"),
    ("CONFIRMED", "Confirmed"),
    ("CANCELLED", "Cancelled"),
    ("COMPLETED", "Completed"),
    ("NO_SHOW", "No show"),
)

APPOINTMENT_TYPE_CHOICES = (
    ("PHYSICAL", "Physical"),
    ("VIRTUAL", "Virtual"),
)


class WorkingHours(models.Model):
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="working_hours",
    )
    day_of_week = models.IntegerField(choices=[(i, i) for i in range(7)])
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ("doctor", "day_of_week", "start_time")
        unique_together = ("doctor", "day_of_week", "start_time", "end_time")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.doctor} {self.day_of_week} {self.start_time}-{self.end_time}"

    def duration(self) -> timedelta:
        dt_start = datetime.combine(timezone.now().date(), self.start_time)
        dt_end = datetime.combine(timezone.now().date(), self.end_time)
        return dt_end - dt_start


class TimeOff(models.Model):
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="time_off"
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ("doctor", "start_datetime")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.doctor} off from {self.start_datetime}"

    def clean(self) -> None:
        if self.start_datetime >= self.end_datetime:
            raise ValidationError("Start datetime must be before end datetime")


class AppointmentQuerySet(models.QuerySet):
    def upcoming(self):
        return self.filter(start_datetime__gte=timezone.now()).order_by("start_datetime")

    def for_day(self, day: datetime):
        return self.filter(start_datetime__date=day.date())


class Appointment(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_appointments",
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_appointments",
    )
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    type = models.CharField(max_length=20, choices=APPOINTMENT_TYPE_CHOICES, default="PHYSICAL")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    reason_text = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AppointmentQuerySet.as_manager()

    class Meta:
        ordering = ("-start_datetime",)
        indexes = [
            models.Index(fields=["doctor", "start_datetime"]),
            models.Index(fields=["patient", "start_datetime"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Appointment {self.pk} {self.start_datetime}"

    def clean(self) -> None:
        if self.start_datetime >= self.end_datetime:
            raise ValidationError("Start datetime must be before end datetime")
        overlapping = Appointment.objects.filter(
            doctor=self.doctor,
            start_datetime__lt=self.end_datetime,
            end_datetime__gt=self.start_datetime,
        )
        if self.pk:
            overlapping = overlapping.exclude(pk=self.pk)
        if overlapping.exists():
            raise ValidationError("Doctor already has an appointment in this slot")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def can_cancel(self) -> bool:
        cutoff = timezone.now() + settings.APPOINTMENT_CANCEL_CUTOFF
        return self.start_datetime >= cutoff

    def transition(self, new_status: str) -> None:
        valid_transitions = {
            "PENDING": {"CONFIRMED", "CANCELLED"},
            "CONFIRMED": {"COMPLETED", "CANCELLED", "NO_SHOW"},
        }
        allowed = valid_transitions.get(self.status, set())
        if new_status not in allowed:
            raise ValidationError(f"Cannot transition from {self.status} to {new_status}")
        self.status = new_status
        self.save(update_fields=["status", "updated_at"])


