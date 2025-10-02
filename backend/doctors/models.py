from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Doctor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile")
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    years_of_experience = models.PositiveIntegerField()
    availability_schedule = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = _("Doctor")
        verbose_name_plural = _("Doctors")

    def __str__(self) -> str:
        return f"{self.name} ({self.specialization})"
