from __future__ import annotations

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.defaultfilters import slugify

User = get_user_model()


class Specialty(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Clinic(models.Model):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    state = models.CharField(max_length=120)
    phone = models.CharField(max_length=50)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.city}, {self.state})"


class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    specialty = models.ForeignKey(Specialty, on_delete=models.PROTECT, related_name="doctors")
    clinic = models.ForeignKey(Clinic, on_delete=models.SET_NULL, related_name="doctors", null=True, blank=True)
    bio = models.TextField(blank=True)
    fee = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("0.00"))
    slot_length_minutes = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ["user__first_name", "user__last_name"]

    def __str__(self) -> str:
        return f"Dr. {self.user.get_full_name() or self.user.username}"

    @property
    def full_name(self) -> str:
        return self.user.get_full_name() or self.user.username


class PatientProfile(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient_profile")
    phone = models.CharField(max_length=30, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self) -> str:
        return f"{self.user.get_full_name() or self.user.username}"


class WeeklyAvailability(models.Model):
    WEEKDAYS = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name="availabilities")
    weekday = models.IntegerField(choices=WEEKDAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_length_minutes = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["doctor", "weekday", "start_time"]
        unique_together = ("doctor", "weekday", "start_time", "end_time")

    def __str__(self) -> str:
        return f"{self.get_weekday_display()} {self.start_time}-{self.end_time}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time.")

    def save(self, *args, **kwargs):
        if self.slot_length_minutes is None:
            self.slot_length_minutes = self.doctor.slot_length_minutes
        self.full_clean()
        super().save(*args, **kwargs)


class Appointment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="patient_appointments")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="doctor_appointments")
    start = models.DateTimeField()
    end = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reason = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start"]
        unique_together = ("doctor", "start")

    def __str__(self) -> str:
        return f"{self.patient} with {self.doctor} on {self.start:%Y-%m-%d %H:%M}"

    def clean(self):
        if self.start >= self.end:
            raise ValidationError("End time must be after start time.")
        overlap_q = Appointment.objects.filter(
            doctor=self.doctor,
            status__in=[self.STATUS_PENDING, self.STATUS_APPROVED, self.STATUS_COMPLETED],
        ).filter(start__lt=self.end, end__gt=self.start)
        if self.pk:
            overlap_q = overlap_q.exclude(pk=self.pk)
        if overlap_q.exists():
            raise ValidationError("This time slot is no longer available.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class ActivityLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_logs")
    action = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    object_id = models.CharField(max_length=255)
    extra = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.action} on {self.model} ({self.object_id})"


@receiver(post_save, sender=User)
def create_patient_profile(sender, instance: User, created: bool, **kwargs):
    if created:
        PatientProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_patient_profile(sender, instance: User, **kwargs):
    if hasattr(instance, "patient_profile"):
        instance.patient_profile.save()
