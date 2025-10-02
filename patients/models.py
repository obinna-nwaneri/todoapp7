from __future__ import annotations

from django.conf import settings
from django.db import models


class Patient(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient_profile")
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField(default=0)
    gender = models.CharField(max_length=32)
    contact_info = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.name
