from __future__ import annotations

from django.urls import path

from . import views

app_name = "notifications"

urlpatterns = [
    path("notifications/mark-read/", views.mark_all_read, name="mark_all_read"),
]
