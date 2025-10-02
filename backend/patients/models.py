from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Patient(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient_profile")
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    contact_info = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = _("Patient")
        verbose_name_plural = _("Patients")

    def __str__(self) -> str:
        return self.name
