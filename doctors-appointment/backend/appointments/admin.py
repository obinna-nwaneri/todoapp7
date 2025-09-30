from django.contrib import admin

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "phone")
    search_fields = ("user__username", "user__first_name", "user__last_name")
    list_filter = ("role",)


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("user", "specialty", "clinic_name", "is_active")
    list_filter = ("specialty", "is_active")
    search_fields = ("user__first_name", "user__last_name", "clinic_name")


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("user", "dob")
    search_fields = ("user__first_name", "user__last_name")


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("doctor", "weekday", "start_time", "end_time", "slot_minutes")
    list_filter = ("weekday", "doctor")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("doctor", "patient", "date", "start_time", "end_time", "status")
    list_filter = ("status", "date", "doctor")
    search_fields = ("doctor__user__last_name", "patient__user__last_name")
    ordering = ("-date", "start_time")
