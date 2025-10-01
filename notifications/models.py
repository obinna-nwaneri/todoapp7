from __future__ import annotations

from django.conf import settings
from django.db import models


class Notification(models.Model):
    CHANNEL_EMAIL = "EMAIL"
    CHANNEL_SMS = "SMS"
    CHANNEL_IN_APP = "IN_APP"

    CHANNEL_CHOICES = (
        (CHANNEL_EMAIL, "Email"),
        (CHANNEL_SMS, "SMS"),
        (CHANNEL_IN_APP, "In-app"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default=CHANNEL_EMAIL)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:  # pragma: no cover
        return f"Notification to {self.user}"

    def mark_read(self) -> None:
        from django.utils import timezone

        if not self.read_at:
            self.read_at = timezone.now()
            self.save(update_fields=["read_at"])


