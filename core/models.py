from __future__ import annotations

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    entity = models.CharField(max_length=255)
    entity_id = models.CharField(max_length=64, blank=True)
    diff = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.action} on {self.entity} ({self.entity_id})"


class SystemSetting(models.Model):
    key = models.CharField(max_length=255, unique=True)
    value = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.key
