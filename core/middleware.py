from __future__ import annotations

from typing import Callable

from django.http import HttpRequest, HttpResponse

from .utils import set_request_context


class AuditLogMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        set_request_context(request)
        response = self.get_response(request)
        return response
