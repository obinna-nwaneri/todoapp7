from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "admin", "action", "entity", "entity_id")
    search_fields = ("action", "entity", "entity_id", "admin__email")
    ordering = ("-created_at",)


