from __future__ import annotations

from typing import Dict

from django.http import HttpRequest

from .models import Notification


def notification_dropdown(request: HttpRequest) -> Dict[str, object]:
    if not request.user.is_authenticated:
        return {"notifications": []}
    notifications = Notification.objects.filter(user=request.user).order_by("-created_at")[:5]
    return {"notifications": notifications}


