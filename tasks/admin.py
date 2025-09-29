from django.contrib import admin

from .models import ActivityLog, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "user",
        "status",
        "priority",
        "due_date",
        "created_at",
    )
    list_filter = ("status", "priority", "due_date", "created_at")
    search_fields = ("title", "description", "user__username")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "task", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("actor__username", "task__title", "extra")
    autocomplete_fields = ("actor", "task")
    ordering = ("-created_at",)
