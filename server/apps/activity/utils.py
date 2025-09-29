from __future__ import annotations

from typing import Any, Optional

from django.utils import timezone

from .models import ActivityLog


def log_activity(*, user, action: str, context: Optional[dict[str, Any]] = None) -> ActivityLog:
    return ActivityLog.objects.create(
        user=user if user and getattr(user, "is_authenticated", False) else None,
        action=action,
        context=context or {},
        created_at=timezone.now(),
    )
