from __future__ import annotations

import django_filters

from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    start_from = django_filters.IsoDateTimeFilter(field_name="start_at", lookup_expr="gte")
    start_to = django_filters.IsoDateTimeFilter(field_name="start_at", lookup_expr="lte")
    doctor = django_filters.NumberFilter(field_name="doctor_id")
    patient = django_filters.NumberFilter(field_name="patient_id")

    class Meta:
        model = Appointment
        fields = ["status", "doctor", "patient", "start_from", "start_to"]
