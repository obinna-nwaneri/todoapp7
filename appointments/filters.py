from __future__ import annotations

import django_filters

from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="start_at", lookup_expr="date__gte")
    end_date = django_filters.DateFilter(field_name="start_at", lookup_expr="date__lte")

    class Meta:
        model = Appointment
        fields = {
            "status": ["exact"],
            "doctor": ["exact"],
            "patient": ["exact"],
        }
