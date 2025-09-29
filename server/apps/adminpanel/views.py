from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import generics, permissions, response, viewsets

from apps.activity.models import ActivityLog
from apps.activity.utils import log_activity
from apps.todos.models import Task

from .serializers import ActivityLogAdminSerializer, TaskAdminSerializer, UserSummarySerializer

User = get_user_model()


class AdminOnlyMixin:
    permission_classes = [permissions.IsAdminUser]


class AdminMetricsView(AdminOnlyMixin, generics.GenericAPIView):
    def get(self, request):
        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)
        active_last_7 = User.objects.filter(last_login__gte=last_7_days).count()
        active_last_30 = User.objects.filter(last_login__gte=last_30_days).count()
        tasks_by_status = Task.objects.values("status").annotate(total=Count("id"))
        tasks_by_priority = Task.objects.values("priority").annotate(total=Count("id"))
        data = {
            "total_users": User.objects.count(),
            "total_tasks": Task.objects.count(),
            "active_last_7_days": active_last_7,
            "active_last_30_days": active_last_30,
            "tasks_by_status": list(tasks_by_status),
            "tasks_by_priority": list(tasks_by_priority),
        }
        return response.Response(data)


class AdminUserListView(AdminOnlyMixin, generics.ListAPIView):
    serializer_class = UserSummarySerializer

    def get_queryset(self):
        return User.objects.annotate(task_count=Count("tasks"))


class AdminActivityListView(AdminOnlyMixin, generics.ListAPIView):
    serializer_class = ActivityLogAdminSerializer

    def get_queryset(self):
        queryset = ActivityLog.objects.all()
        user_param = self.request.query_params.get("user")
        if user_param:
            queryset = queryset.filter(user__id=user_param)
        action = self.request.query_params.get("action")
        if action:
            queryset = queryset.filter(action=action)
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start:
            dt = parse_datetime(start) or _parse_date(start)
            if dt:
                queryset = queryset.filter(created_at__gte=dt)
        if end:
            dt = parse_datetime(end) or _parse_date(end)
            if dt:
                queryset = queryset.filter(created_at__lte=dt)
        return queryset


def _parse_date(value: str):
    try:
        return timezone.make_aware(datetime.fromisoformat(value))
    except (ValueError, TypeError):
        return None


class AdminTaskViewSet(AdminOnlyMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskAdminSerializer

    def perform_create(self, serializer):
        task = serializer.save()
        log_activity(user=self.request.user, action="task_create", context={"task_id": task.id, "admin": True})

    def perform_update(self, serializer):
        task = serializer.save()
        log_activity(user=self.request.user, action="task_update", context={"task_id": task.id, "admin": True})

    def perform_destroy(self, instance):
        task_id = instance.id
        super().perform_destroy(instance)
        log_activity(user=self.request.user, action="task_delete", context={"task_id": task_id, "admin": True})
