from __future__ import annotations

import threading
from typing import Any

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.http import HttpRequest
from django.utils import timezone

from .models import AuditLog, GlobalSetting, NotificationPreference

_request_local = threading.local()


def set_request_context(request: HttpRequest) -> None:
    _request_local.request = request


def get_current_request() -> HttpRequest | None:
    return getattr(_request_local, "request", None)


def record_audit(action: str, entity: str, entity_id: str | int | None = None, diff: Any | None = None) -> None:
    request = get_current_request()
    actor = None
    ip_address = None
    user_agent = None
    if request:
        actor = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")
    AuditLog.objects.create(
        actor=actor,
        action=action,
        entity=entity,
        entity_id=str(entity_id or ""),
        diff=diff,
        ip_address=ip_address,
        user_agent=user_agent,
    )


def get_setting(key: str, default: Any) -> Any:
    setting, _ = GlobalSetting.objects.get_or_create(key=key, defaults={"value": default})
    return setting.value or default


def update_setting(key: str, value: Any, description: str | None = None) -> GlobalSetting:
    setting, _ = GlobalSetting.objects.update_or_create(
        key=key, defaults={"value": value, "description": description or ""}
    )
    record_audit("update_setting", "GlobalSetting", key, diff=value)
    return setting


def send_notification(users: list[tuple[str, str]], subject: str, message: str) -> None:
    if not users:
        return
    emails = []
    for email, channel in users:
        if channel == "email":
            emails.append(email)
    if emails:
        send_mail(subject, message, "noreply@clinic.local", emails, fail_silently=True)


def notify_user(user, subject: str, message: str) -> None:
    try:
        prefs = NotificationPreference.objects.get(user=user)
    except NotificationPreference.DoesNotExist:
        prefs = NotificationPreference.objects.create(user=user)
    if prefs.email_enabled:
        send_notification([(user.email, "email")], subject, message)


def notify_users(users: list, subject: str, message: str) -> None:
    for user in users:
        notify_user(user, subject, message)


def ensure_notification_pref(user) -> None:
    NotificationPreference.objects.get_or_create(user=user)


def get_reminder_hours() -> list[int]:
    from django.conf import settings

    conf = getattr(settings, "REMINDER_DEFAULTS", {"hours_before": [24, 2]})
    stored = get_setting("reminder_config", conf)
    return stored.get("hours_before", conf["hours_before"])


def get_cancellation_window_hours() -> int:
    from django.conf import settings

    conf = getattr(settings, "CANCELLATION_POLICY", {"hours_before": 2})
    stored = get_setting("cancellation_policy", conf)
    return int(stored.get("hours_before", conf["hours_before"]))


def system_user() -> Any:
    User = get_user_model()
    return User.objects.filter(role=User.Role.ADMIN, is_superuser=True).first()


def upcoming_window(hours: int):
    now = timezone.now()
    return now + timezone.timedelta(hours=hours)
