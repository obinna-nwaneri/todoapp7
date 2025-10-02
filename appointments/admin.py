from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "start_at", "status")
    search_fields = ("patient__name", "doctor__name", "symptoms")
    list_filter = ("status", "start_at")
