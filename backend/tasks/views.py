from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from tasks.models import Task
from tasks.serializers import AdminTaskSerializer, TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.filter(owner=self.request.user)
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        priority_value = self.request.query_params.get("priority")
        if priority_value:
            queryset = queryset.filter(priority=priority_value)
        upcoming = self.request.query_params.get("upcoming")
        if upcoming == "true":
            queryset = queryset.filter(due_date__gte=timezone.now().date()).order_by("due_date")
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AdminTaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related("owner").all()
    serializer_class = AdminTaskSerializer
    permission_classes = [IsAdminUser]
