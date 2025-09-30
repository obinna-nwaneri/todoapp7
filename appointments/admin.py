from django.contrib import admin

from .models import (
    ActivityLog,
    Appointment,
    Clinic,
    DoctorProfile,
    PatientProfile,
    Specialty,
    WeeklyAvailability,
)


class WeeklyAvailabilityInline(admin.TabularInline):
    model = WeeklyAvailability
    extra = 0


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "state", "phone")
    search_fields = ("name", "city", "state")


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "specialty", "clinic", "is_active")
    list_filter = ("specialty", "is_active")
    search_fields = ("user__username", "user__first_name", "user__last_name")
    inlines = [WeeklyAvailabilityInline]


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "gender")
    search_fields = ("user__username", "user__first_name", "user__last_name", "phone")


@admin.register(WeeklyAvailability)
class WeeklyAvailabilityAdmin(admin.ModelAdmin):
    list_display = ("doctor", "weekday", "start_time", "end_time", "slot_length_minutes")
    list_filter = ("weekday",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "start", "end", "status")
    list_filter = ("status", "doctor")
    search_fields = ("patient__username", "doctor__username")
    autocomplete_fields = ("patient", "doctor")


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("actor", "action", "model", "created_at")
    list_filter = ("action", "model")
    search_fields = ("actor__username", "action", "model", "object_id")
    readonly_fields = ("created_at",)
