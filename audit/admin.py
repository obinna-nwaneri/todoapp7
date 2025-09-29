from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action", "user", "entity", "entity_id", "created_at")
    list_filter = ("action", "entity", "created_at")
    search_fields = ("user__username", "entity", "meta")
    readonly_fields = ("created_at",)
