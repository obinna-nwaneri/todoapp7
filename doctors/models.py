from __future__ import annotations

from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    years_experience = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    contact_info = models.TextField(blank=True)
    availability_rule = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return self.name


class TimeBlock(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="time_blocks")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("start_at",)

    def clean(self) -> None:
        if self.start_at >= self.end_at:
            raise ValueError("start_at must be before end_at")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.doctor} block {self.start_at} - {self.end_at}"
