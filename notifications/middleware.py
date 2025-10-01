from __future__ import annotations

from typing import Callable

from django.http import HttpRequest, HttpResponse


class NotificationMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if request.user.is_authenticated:
            request.unread_notification_count = request.user.notification_set.filter(
                read_at__isnull=True
            ).count()
        else:
            request.unread_notification_count = 0
        response = self.get_response(request)
        return response


