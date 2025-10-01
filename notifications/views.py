from __future__ import annotations

from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.utils import timezone
from django.views.decorators.http import require_POST


@login_required
@require_POST
def mark_all_read(request: HttpRequest) -> HttpResponse:
    request.user.notification_set.filter(read_at__isnull=True).update(read_at=timezone.now())
    return HttpResponse(status=204)
