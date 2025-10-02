from django.contrib import admin

from .models import Doctor, TimeBlock


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialization", "years_experience")
    search_fields = ("name", "specialization", "user__email")


@admin.register(TimeBlock)
class TimeBlockAdmin(admin.ModelAdmin):
    list_display = ("doctor", "start_at", "end_at", "reason")
    search_fields = ("doctor__name", "reason")
    list_filter = ("doctor",)
