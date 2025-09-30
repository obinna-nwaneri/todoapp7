from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import List, TypedDict

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django.template.defaultfilters import slugify
from django.utils import timezone

User = get_user_model()


class Profile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)
    phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.user.get_full_name()} ({self.role})"


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):  # type: ignore[override]
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor")
    specialty = models.ForeignKey(Specialty, on_delete=models.PROTECT, related_name="doctors")
    clinic_name = models.CharField(max_length=200)
    about = models.TextField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self) -> str:
        return f"Dr. {self.user.get_full_name()}"


class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient")
    dob = models.DateField()
    address = models.TextField(blank=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self) -> str:
        return self.user.get_full_name() or self.user.username


class Availability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="availabilities")
    weekday = models.PositiveSmallIntegerField(help_text="0=Monday, 6=Sunday")
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveIntegerField(default=30)

    class Meta:
        ordering = ["doctor", "weekday", "start_time"]
        unique_together = ("doctor", "weekday", "start_time", "end_time")

    def clean(self) -> None:
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time.")
        if self.slot_minutes <= 0:
            raise ValidationError("Slot minutes must be positive.")

    def __str__(self) -> str:
        return f"{self.doctor} {self.weekday} {self.start_time}-{self.end_time}"


class AppointmentSlot(TypedDict):
    start_time: time
    end_time: time


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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "start_time"]
        unique_together = ("doctor", "date", "start_time")
        indexes = [
            models.Index(fields=["doctor", "date"]),
            models.Index(fields=["patient", "date"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.doctor} with {self.patient} on {self.date}"

    def clean(self) -> None:  # type: ignore[override]
        super().clean()
        if self.start_time >= self.end_time:
            raise ValidationError({"end_time": "End time must be after start time."})

        now = timezone.localtime()
        appointment_dt = datetime.combine(self.date, self.start_time)
        appointment_dt = timezone.make_aware(appointment_dt, timezone.get_current_timezone())
        if appointment_dt < now:
            raise ValidationError("Cannot create appointments in the past.")

        availabilities = self.doctor.availabilities.filter(weekday=self.date.weekday())
        if not availabilities.exists():
            raise ValidationError("Doctor is not available on this date.")

        matching_availability: Availability | None = None
        for availability in availabilities:
            if availability.start_time <= self.start_time and availability.end_time >= self.end_time:
                matching_availability = availability
                break
        if matching_availability is None:
            raise ValidationError("Time is outside doctor's availability.")

        slot_minutes = matching_availability.slot_minutes
        start_delta = _minutes_between(matching_availability.start_time, self.start_time)
        end_delta = _minutes_between(matching_availability.start_time, self.end_time)
        duration = _minutes_between(self.start_time, self.end_time)
        if start_delta % slot_minutes != 0 or end_delta % slot_minutes != 0:
            raise ValidationError("Appointment times must align to the slot grid.")
        if duration != slot_minutes:
            raise ValidationError("Appointment must match the slot duration.")

        overlaps = Appointment.objects.filter(
            doctor=self.doctor,
            date=self.date,
        ).exclude(pk=self.pk).exclude(status=Appointment.Status.CANCELLED)

        for existing in overlaps:
            if _times_overlap(self.start_time, self.end_time, existing.start_time, existing.end_time):
                raise ValidationError("Appointment overlaps with an existing booking.")

    def save(self, *args, **kwargs):  # type: ignore[override]
        self.full_clean()
        return super().save(*args, **kwargs)


def _minutes_between(start: time, end: time) -> int:
    dummy_date = datetime(2000, 1, 1)
    start_dt = datetime.combine(dummy_date, start)
    end_dt = datetime.combine(dummy_date, end)
    return int((end_dt - start_dt).total_seconds() // 60)


def _times_overlap(start1: time, end1: time, start2: time, end2: time) -> bool:
    return max(start1, start2) < min(end1, end2)


def generate_slots(doctor: Doctor, date: date) -> List[AppointmentSlot]:
    weekday = date.weekday()
    availabilities = doctor.availabilities.filter(weekday=weekday)
    slots: List[AppointmentSlot] = []
    if not availabilities.exists():
        return slots

    existing = doctor.appointments.filter(
        date=date,
    ).exclude(status=Appointment.Status.CANCELLED)

    booked_ranges = [(appointment.start_time, appointment.end_time) for appointment in existing]

    now = timezone.localtime()
    for availability in availabilities:
        start_pointer = availability.start_time
        delta = timedelta(minutes=availability.slot_minutes)
        while True:
            end_pointer = (datetime.combine(date, start_pointer) + delta).time()
            if end_pointer > availability.end_time:
                break

            slot_dt = datetime.combine(date, start_pointer)
            slot_dt = timezone.make_aware(slot_dt, timezone.get_current_timezone())
            if slot_dt < now:
                start_pointer = end_pointer
                continue

            if any(_times_overlap(start_pointer, end_pointer, booked_start, booked_end) for booked_start, booked_end in booked_ranges):
                start_pointer = end_pointer
                continue

            slots.append({"start_time": start_pointer, "end_time": end_pointer})
            start_pointer = end_pointer

    return slots
