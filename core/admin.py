from django.contrib import admin

from .models import AuditLog, SystemSetting


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity", "entity_id", "actor", "created_at")
    search_fields = ("action", "entity", "entity_id", "actor__email")
    list_filter = ("action", "entity")
    readonly_fields = ("actor", "action", "entity", "entity_id", "diff", "ip_address", "user_agent", "created_at")


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ("key",)
    search_fields = ("key",)
