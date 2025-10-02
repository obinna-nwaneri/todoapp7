from django.contrib import admin

from .models import Appointment, Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialization")
    search_fields = ("name", "specialization")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "date", "time", "status")
    list_filter = ("status", "doctor")
    search_fields = ("patient__email", "doctor__name", "symptoms")
    ordering = ("-date", "-time")
