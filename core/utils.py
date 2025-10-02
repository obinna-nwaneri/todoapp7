from __future__ import annotations

from typing import Iterable

from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpRequest

from .models import AuditLog


def record_audit_log(
    *,
    actor,
    action: str,
    entity: str,
    entity_id: str | int | None,
    diff: dict | None = None,
    request: HttpRequest | None = None,
) -> None:
    AuditLog.objects.create(
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        action=action,
        entity=entity,
        entity_id=str(entity_id or ""),
        diff=diff or {},
        ip_address=(request.META.get("REMOTE_ADDR") if request else None),
        user_agent=(request.META.get("HTTP_USER_AGENT") if request else ""),
    )


def send_notification(recipients: Iterable[str], subject: str, message: str) -> None:
    if not recipients:
        return
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, list(recipients), fail_silently=True)
