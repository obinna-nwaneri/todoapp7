from datetime import date, timedelta

import django_filters

from .models import Task


class TaskFilter(django_filters.FilterSet):
    due = django_filters.CharFilter(method="filter_due")

    class Meta:
        model = Task
        fields = {
            "status": ["exact"],
            "priority": ["exact"],
        }

    def filter_due(self, queryset, name, value):
        today = date.today()
        if value == "overdue":
            return queryset.filter(due_date__lt=today)
        if value == "today":
            return queryset.filter(due_date=today)
        if value == "week":
            end_week = today + timedelta(days=7)
            return queryset.filter(due_date__range=(today, end_week))
        return queryset
