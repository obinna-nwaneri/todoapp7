from django.contrib import admin

from .models import Appointment, TimeOff, WorkingHours


@admin.register(WorkingHours)
class WorkingHoursAdmin(admin.ModelAdmin):
    list_display = ("doctor", "day_of_week", "start_time", "end_time")
    list_filter = ("day_of_week",)


@admin.register(TimeOff)
class TimeOffAdmin(admin.ModelAdmin):
    list_display = ("doctor", "start_datetime", "end_datetime")
    list_filter = ("doctor",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("doctor", "patient", "start_datetime", "status")
    list_filter = ("status", "doctor")
    search_fields = ("doctor__first_name", "doctor__last_name", "patient__first_name", "patient__last_name")


