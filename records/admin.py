from django.contrib import admin

from .models import Prescription


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ("appointment", "doctor", "created_at")
    search_fields = ("doctor__first_name", "doctor__last_name", "appointment__patient__first_name")


