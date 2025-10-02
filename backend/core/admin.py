from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Doctor, Patient, Appointment


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "is_staff")
    list_filter = ("role", "is_staff")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password", "role")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "role", "password1", "password2"),
            },
        ),
    )
    search_fields = ("email", "first_name", "last_name")


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialization", "years_of_experience")
    search_fields = ("name", "specialization")
    autocomplete_fields = ("user",)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("name", "age", "gender", "contact_info")
    search_fields = ("name", "contact_info")
    autocomplete_fields = ("user",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "date", "time", "status")
    list_filter = ("status", "date")
    search_fields = ("patient__name", "doctor__name", "symptoms")
    autocomplete_fields = ("patient", "doctor")
