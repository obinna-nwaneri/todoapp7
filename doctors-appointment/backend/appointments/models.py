from __future__ import annotations

from datetime import datetime, time, timedelta
from typing import List, Tuple

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=20, blank=True)

    def __str__(self) -> str:  # pragma: no cover - human readable
        return f"{self.user.get_full_name()} ({self.role})"


class Specialty(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - human readable
        return self.name


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE, related_name="doctors")
    clinic_name = models.CharField(max_length=255)
    about = models.TextField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self) -> str:  # pragma: no cover - human readable
        return f"Dr. {self.user.get_full_name()}"


class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_profile")
    dob = models.DateField()
    address = models.TextField(blank=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self) -> str:  # pragma: no cover - human readable
        return self.user.get_full_name()


class Availability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="availabilities")
    weekday = models.PositiveSmallIntegerField(help_text="0=Mon .. 6=Sun")
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveIntegerField(default=30)

    class Meta:
        ordering = ["doctor", "weekday", "start_time"]
        unique_together = ("doctor", "weekday", "start_time", "end_time")

    def clean(self) -> None:
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time")
        if self.slot_minutes <= 0:
            raise ValidationError("Slot minutes must be positive")

    def save(self, *args, **kwargs) -> None:
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:  # pragma: no cover - human readable
        return f"{self.doctor} availability on {self.weekday}"


def generate_timeslots(start: time, end: time, slot_minutes: int) -> List[Tuple[time, time]]:
    """Generate time slots between start and end times."""
    slots: List[Tuple[time, time]] = []
    current_dt = datetime.combine(datetime.today(), start)
    end_dt = datetime.combine(datetime.today(), end)
    delta = timedelta(minutes=slot_minutes)

    while current_dt + delta <= end_dt:
        slot_end = current_dt + delta
        slots.append((current_dt.time(), slot_end.time()))
        current_dt = slot_end
    return slots


def doctor_day_slots(doctor: Doctor, target_date: datetime.date) -> List[Tuple[time, time]]:
    weekday = target_date.weekday()
    slots: List[Tuple[time, time]] = []
    availabilities = doctor.availabilities.filter(weekday=weekday)
    for availability in availabilities:
        slots.extend(generate_timeslots(availability.start_time, availability.end_time, availability.slot_minutes))
    return slots


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        ordering = ["-date", "start_time"]
        unique_together = ("doctor", "date", "start_time")

    def clean(self) -> None:
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time")

        today = timezone.localdate()
        active_statuses = {Appointment.Status.PENDING, Appointment.Status.CONFIRMED}
        if self.date < today and self.status in active_statuses:
            raise ValidationError("Cannot book appointments in the past")
        if self.date > today + timedelta(days=30) and self.status in active_statuses:
            raise ValidationError("Appointments can only be booked 30 days in advance")
        if self.date == today and self.status in active_statuses:
            now_time = timezone.localtime().time()
            if self.start_time <= now_time:
                raise ValidationError("Appointment start time must be in the future")

        availabilities = self.doctor.availabilities.filter(weekday=self.date.weekday())
        matching_availability: Availability | None = None
        for availability in availabilities:
            if availability.start_time <= self.start_time and availability.end_time >= self.end_time:
                # ensure slots align with slot_minutes
                total_minutes = int(
                    (
                        datetime.combine(self.date, self.end_time)
                        - datetime.combine(self.date, self.start_time)
                    ).total_seconds()
                    / 60
                )
                offset_minutes = int(
                    (
                        datetime.combine(self.date, self.start_time)
                        - datetime.combine(self.date, availability.start_time)
                    ).total_seconds()
                    / 60
                )
                if offset_minutes % availability.slot_minutes == 0 and total_minutes % availability.slot_minutes == 0:
                    matching_availability = availability
                    break
        if not matching_availability:
            raise ValidationError("Selected time is outside the doctor's availability")

        overlap_exists = (
            Appointment.objects.filter(
                doctor=self.doctor,
                date=self.date,
                status__in=[Appointment.Status.PENDING, Appointment.Status.CONFIRMED, Appointment.Status.COMPLETED],
            )
            .exclude(pk=self.pk)
            .filter(
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
            )
            .exists()
        )
        if overlap_exists:
            raise ValidationError("Appointment overlaps with an existing booking")

    def save(self, *args, **kwargs) -> None:
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:  # pragma: no cover - human readable
        return f"Appointment for {self.patient} with {self.doctor} on {self.date}"

    @property
    def duration_minutes(self) -> int:
        return int(
            (
                datetime.combine(self.date, self.end_time)
                - datetime.combine(self.date, self.start_time)
            ).total_seconds()
            / 60
        )


__all__ = [
    "Profile",
    "Specialty",
    "Doctor",
    "Patient",
    "Availability",
    "Appointment",
    "doctor_day_slots",
]
