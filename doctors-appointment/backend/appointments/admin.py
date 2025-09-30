"""Admin registrations for appointments."""
from __future__ import annotations

from django.contrib import admin

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "phone", "gender")
    list_filter = ("role",)
    search_fields = ("user__username", "user__first_name", "user__last_name")


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


class AppointmentInline(admin.TabularInline):
    model = Appointment
    extra = 0
    fields = ("date", "start_time", "end_time", "patient", "status")
    readonly_fields = fields
    can_delete = False
    show_change_link = True


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("user", "specialty", "clinic_name", "consultation_fee", "is_active")
    list_filter = ("specialty", "is_active")
    search_fields = ("user__first_name", "user__last_name", "clinic_name")
    inlines = [AppointmentInline]


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("user", "dob")
    search_fields = ("user__first_name", "user__last_name", "user__username")


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("doctor", "weekday", "start_time", "end_time", "slot_minutes")
    list_filter = ("weekday", "slot_minutes")
    search_fields = ("doctor__user__first_name", "doctor__user__last_name", "doctor__clinic_name")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("doctor", "patient", "date", "start_time", "end_time", "status")
    list_filter = ("status", "date", "doctor__specialty")
    search_fields = (
        "doctor__user__first_name",
        "doctor__user__last_name",
        "patient__user__first_name",
        "patient__user__last_name",
        "reason",
    )
    ordering = ("-date", "start_time")
