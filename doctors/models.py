from __future__ import annotations

from django.conf import settings
from django.db import models


class Doctor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile")
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    years_experience = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    contact_info = models.TextField(blank=True)
    availability_rule = models.JSONField(default=list, blank=True)

    def __str__(self) -> str:
        return self.name


class TimeBlock(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="blocked_times")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["start_at"]

    def __str__(self) -> str:
        return f"{self.doctor.name}: {self.start_at} - {self.end_at}"
