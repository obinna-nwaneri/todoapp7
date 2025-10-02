from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=255)
    entity = models.CharField(max_length=255)
    entity_id = models.CharField(max_length=255, blank=True)
    diff = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        actor = self.actor.email if self.actor else "system"
        return f"{self.action} by {actor} at {self.created_at.isoformat()}"


class GlobalSetting(models.Model):
    key = models.CharField(max_length=255, unique=True)
    value = models.JSONField(default=dict)
    description = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.key


class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email_enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Notification preferences for {self.user.email}"
