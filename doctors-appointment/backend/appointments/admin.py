from __future__ import annotations

from django.contrib import admin

from .models import Appointment, Availability, Doctor, Patient, Specialty


class DoctorAvailabilityInline(admin.TabularInline):
    model = Availability
    extra = 0


class AppointmentInline(admin.TabularInline):
    model = Appointment
    extra = 0
    readonly_fields = ["patient", "date", "start_time", "end_time", "status"]
    can_delete = False
    show_change_link = True


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ["user", "specialty", "clinic_name", "is_active"]
    list_filter = ["specialty", "is_active"]
    search_fields = ["user__first_name", "user__last_name", "clinic_name"]
    inlines = [DoctorAvailabilityInline, AppointmentInline]


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ["user", "dob", "phone"]
    search_fields = ["user__first_name", "user__last_name"]

    @admin.display(description="Phone")
    def phone(self, obj):
        return getattr(getattr(obj.user, "profile", None), "phone", "-")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["doctor", "patient", "date", "start_time", "end_time", "status"]
    list_filter = ["status", "date", "doctor__specialty"]
    search_fields = ["patient__user__first_name", "patient__user__last_name", "doctor__user__first_name", "doctor__user__last_name"]
    ordering = ["-date", "start_time"]


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ["doctor", "weekday", "start_time", "end_time", "slot_minutes"]
    list_filter = ["weekday", "doctor"]
    search_fields = ["doctor__user__first_name", "doctor__user__last_name", "doctor__clinic_name"]
