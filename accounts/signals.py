from __future__ import annotations

from django.db.models.signals import post_save
from django.dispatch import receiver

from core.utils import ensure_notification_pref

from .models import User


@receiver(post_save, sender=User)
def create_notification_pref(sender, instance: User, created: bool, **kwargs):
    if created:
        ensure_notification_pref(instance)
