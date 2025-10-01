from __future__ import annotations

import json
from typing import Callable

from django.http import HttpRequest, HttpResponse

from .models import AuditLog


class AdminAuditMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        if (
            request.path.startswith("/admin-panel/")
            and request.method in {"POST", "PATCH", "DELETE"}
            and request.user.is_authenticated
            and request.user.is_staff
            and response.status_code < 400
        ):
            payload = {}
            if request.body:
                try:
                    payload = json.loads(request.body.decode("utf-8"))
                except Exception:  # pragma: no cover - fallback for non json payloads
                    payload = {"raw": request.body.decode("utf-8", errors="ignore")}
            AuditLog.objects.create(
                admin=request.user,
                action=f"{request.method} {request.path}",
                entity=request.resolver_match.view_name if request.resolver_match else "unknown",
                entity_id=request.POST.get("id", "n/a"),
                meta={"payload": payload},
            )
        return response


