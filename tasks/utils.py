from __future__ import annotations

from typing import Any, Optional

from django.contrib.auth.models import AnonymousUser

from .models import ActivityLog, Task


def log_activity(actor: Any, action: str, task: Optional[Task] = None, extra: Optional[dict] = None) -> None:
    """Persist a lightweight audit trail entry."""
    user = None
    if actor and not isinstance(actor, AnonymousUser):
        user = actor
    ActivityLog.objects.create(actor=user, action=action, task=task, extra=extra or {})
