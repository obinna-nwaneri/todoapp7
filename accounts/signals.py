from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver

from audit.models import ActivityLog


def _extract_request_meta(request):
    if request is None:
        return None, ""
    meta = request.META
    ip_address = meta.get("HTTP_X_FORWARDED_FOR", meta.get("REMOTE_ADDR", ""))
    if ip_address and "," in ip_address:
        ip_address = ip_address.split(",")[0].strip()
    user_agent = meta.get("HTTP_USER_AGENT", "")
    return ip_address or None, user_agent


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    ip, ua = _extract_request_meta(request)
    ActivityLog.objects.create(
        user=user,
        action="login",
        entity="User",
        entity_id=user.pk,
        ip_address=ip,
        user_agent=ua,
    )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    ip, ua = _extract_request_meta(request)
    ActivityLog.objects.create(
        user=user,
        action="logout",
        entity="User",
        entity_id=getattr(user, "pk", None),
        ip_address=ip,
        user_agent=ua,
    )
