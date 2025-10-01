from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "channel", "subject", "sent_at", "read_at")
    list_filter = ("channel", "sent_at", "read_at")
    search_fields = ("user__email", "subject")


