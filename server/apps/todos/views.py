from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.activity.utils import log_activity

from .filters import TaskFilter
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date", "priority"]

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        task = serializer.save()
        log_activity(user=self.request.user, action="task_create", context={"task_id": task.id})

    def perform_update(self, serializer):
        task = serializer.save()
        log_activity(user=self.request.user, action="task_update", context={"task_id": task.id})

    def perform_destroy(self, instance):
        task_id = instance.id
        super().perform_destroy(instance)
        log_activity(user=self.request.user, action="task_delete", context={"task_id": task_id})
