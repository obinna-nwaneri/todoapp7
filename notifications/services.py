from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Callable, Iterable, Sequence

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from accounts.models import User

from .models import Notification

logger = logging.getLogger(__name__)


@dataclass
class DeliveryResult:
    channel: str
    notification: Notification


class NotificationService:
    """Dispatch notifications across email, SMS, and in-app channels."""

    def __init__(self, *, email_sender: Callable | None = None, sms_sender: Callable | None = None):
        self.email_sender = email_sender or send_mail
        self.sms_sender = sms_sender or self._default_sms_sender

    def send(
        self,
        user: User,
        subject: str,
        body: str,
        channels: Sequence[str] | None = None,
    ) -> Iterable[DeliveryResult]:
        chosen_channels = list(channels or [Notification.CHANNEL_EMAIL])
        results: list[DeliveryResult] = []
        for channel in chosen_channels:
            notification = Notification.objects.create(
                user=user,
                channel=channel,
                subject=subject,
                body=body,
            )
            if channel == Notification.CHANNEL_EMAIL:
                self._send_email(user, subject, body)
            elif channel == Notification.CHANNEL_SMS:
                self._send_sms(user, body)
            notification.sent_at = timezone.now()
            notification.save(update_fields=["sent_at"])
            results.append(DeliveryResult(channel=channel, notification=notification))
        return results

    # Email helpers -----------------------------------------------------
    def _send_email(self, user: User, subject: str, body: str) -> None:
        if not user.email:
            logger.info("Skipping email notification for %s - no email on file", user.pk)
            return
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")
        self.email_sender(subject, body, from_email, [user.email])

    # SMS helpers -------------------------------------------------------
    def _send_sms(self, user: User, body: str) -> None:
        if not user.phone:
            logger.info("Skipping SMS notification for %s - no phone on file", user.pk)
            return
        self.sms_sender(user.phone, body)

    @staticmethod
    def _default_sms_sender(phone_number: str, body: str) -> None:
        logger.info("SMS → %s: %s", phone_number, body)
