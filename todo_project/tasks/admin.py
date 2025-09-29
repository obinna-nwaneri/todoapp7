from __future__ import annotations

from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "due_date", "priority", "status", "created_at")
    list_filter = ("priority", "status", "due_date", "owner")
    search_fields = ("title", "description", "owner__username")
