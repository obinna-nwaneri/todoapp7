from django.contrib import admin

from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "specialization", "years_of_experience", "user")
    search_fields = ("name", "specialization", "user__email")
