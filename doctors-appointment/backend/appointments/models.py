"""Database models for the appointments domain."""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import List, TypedDict

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

class Profile(models.Model):
    """Additional metadata for Django's built-in User."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DOCTOR = "DOCTOR", "Doctor"
        PATIENT = "PATIENT", "Patient"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)
    phone = models.CharField(max_length=50, blank=True)
    gender = models.CharField(max_length=20, blank=True)

    class Meta:
        indexes = [models.Index(fields=["role"])]

    def __str__(self) -> str:
        return f"{self.user.username} ({self.get_role_display()})"


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs) -> None:  # type: ignore[override]
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Doctor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile")
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE, related_name="doctors")
    clinic_name = models.CharField(max_length=150)
    about = models.TextField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]
        indexes = [
            models.Index(fields=["specialty", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"Dr. {self.user.get_full_name()}"


class Patient(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient_profile")
    dob = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self) -> str:
        return self.user.get_full_name() or self.user.username


class Availability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="availabilities")
    weekday = models.PositiveSmallIntegerField(help_text="0=Mon .. 6=Sun")
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveIntegerField(default=30)

    class Meta:
        ordering = ["doctor", "weekday", "start_time"]
        indexes = [
            models.Index(fields=["doctor", "weekday"]),
        ]

    def __str__(self) -> str:
        return f"{self.doctor} {self.weekday} {self.start_time}-{self.end_time}"


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
        constraints = [
            models.UniqueConstraint(fields=["doctor", "date", "start_time"], name="unique_doctor_slot"),
        ]
        indexes = [
            models.Index(fields=["doctor", "date"]),
            models.Index(fields=["patient", "date"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.date} {self.doctor} with {self.patient}"

    def clean(self) -> None:  # type: ignore[override]
        errors: dict[str, str] = {}
        if not self.doctor_id or not self.patient_id:
            return

        if self.start_time >= self.end_time:
            errors["end_time"] = "End time must be after start time."

        today = timezone.localdate()
        appointment_start_naive = datetime.combine(self.date, self.start_time)
        appointment_end_naive = datetime.combine(self.date, self.end_time)
        appointment_start_dt = timezone.make_aware(appointment_start_naive)
        appointment_end_dt = timezone.make_aware(appointment_end_naive)

        if self.status in {self.Status.PENDING, self.Status.CONFIRMED}:
            if appointment_start_dt < timezone.localtime():
                errors["date"] = "Cannot book appointments in the past."
            if self.date > today + timedelta(days=30):
                errors["date"] = "Appointments cannot be booked more than 30 days in advance."

        weekday = self.date.weekday()
        availabilities = list(self.doctor.availabilities.filter(weekday=weekday))
        if not availabilities:
            errors["date"] = "Doctor has no availability on this day."
        else:
            within_any = False
            grid_aligned = False
            for availability in availabilities:
                start_window = timezone.make_aware(datetime.combine(self.date, availability.start_time))
                end_window = timezone.make_aware(datetime.combine(self.date, availability.end_time))
                if appointment_start_dt >= start_window and appointment_end_dt <= end_window:
                    within_any = True
                    minutes_from_start = int((appointment_start_dt - start_window).total_seconds() // 60)
                    minutes_to_end = int((appointment_end_dt - start_window).total_seconds() // 60)
                    duration_minutes = int((appointment_end_dt - appointment_start_dt).total_seconds() // 60)
                    if minutes_from_start % availability.slot_minutes == 0 and minutes_to_end % availability.slot_minutes == 0 and duration_minutes % availability.slot_minutes == 0:
                        grid_aligned = True
                        break
            if not within_any:
                errors["date"] = "Appointment must fall within doctor availability."
            elif not grid_aligned:
                errors["start_time"] = "Appointment must align to the doctor's slot schedule."

        overlap_qs = Appointment.objects.filter(
            doctor=self.doctor,
            date=self.date,
        ).exclude(pk=self.pk).exclude(status=self.Status.CANCELLED)
        for other in overlap_qs:
            other_start = datetime.combine(other.date, other.start_time)
            other_end = datetime.combine(other.date, other.end_time)
            if other_start < appointment_end_naive and appointment_start_naive < other_end:
                errors["start_time"] = "Selected time overlaps with another appointment."
                break

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs) -> None:  # type: ignore[override]
        self.full_clean()
        super().save(*args, **kwargs)


class SlotDict(TypedDict):
    start_time: str
    end_time: str


def generate_slots(doctor: Doctor, appointment_date: date) -> List[SlotDict]:
    """Generate available slots for a doctor on the given date."""
    weekday = appointment_date.weekday()
    availabilities = doctor.availabilities.filter(weekday=weekday)
    slots: list[SlotDict] = []
    taken = Appointment.objects.filter(
        doctor=doctor,
        date=appointment_date,
    ).exclude(status=Appointment.Status.CANCELLED)
    taken_ranges = [
        (datetime.combine(app.date, app.start_time), datetime.combine(app.date, app.end_time))
        for app in taken
    ]
    for availability in availabilities:
        slot_length = timedelta(minutes=availability.slot_minutes)
        current = datetime.combine(appointment_date, availability.start_time)
        end_window = datetime.combine(appointment_date, availability.end_time)
        while current + slot_length <= end_window:
            candidate_start = current
            candidate_end = current + slot_length
            overlap = False
            for start, end in taken_ranges:
                if start < candidate_end and candidate_start < end:
                    overlap = True
                    break
            if not overlap:
                slots.append(
                    {
                        "start_time": candidate_start.time().strftime("%H:%M"),
                        "end_time": candidate_end.time().strftime("%H:%M"),
                    }
                )
            current += slot_length
    return slots
