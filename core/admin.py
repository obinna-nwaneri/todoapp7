from django.contrib import admin

from .models import AuditLog, GlobalSetting, NotificationPreference


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity", "entity_id", "actor", "created_at")
    search_fields = ("action", "entity", "entity_id", "actor__email")
    list_filter = ("action", "created_at")


@admin.register(GlobalSetting)
class GlobalSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "description")
    search_fields = ("key",)


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "email_enabled", "sms_enabled", "push_enabled")
    search_fields = ("user__email",)
