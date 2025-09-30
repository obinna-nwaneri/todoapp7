from __future__ import annotations

from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver

from .services import log_activity


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    log_activity(user, "user_login", user, {"ip": request.META.get("REMOTE_ADDR")})


@receiver(user_logged_out)
def on_user_logged_out(sender, request, user, **kwargs):
    if user:
        log_activity(user, "user_logout", user)
