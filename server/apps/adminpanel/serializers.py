from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.activity.models import ActivityLog
from apps.todos.models import Task

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "last_login", "date_joined", "task_count"]


class ActivityLogAdminSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = ActivityLog
        fields = ["id", "user", "action", "context", "created_at"]


class TaskAdminSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "priority",
            "status",
            "owner",
            "owner_username",
            "created_at",
            "updated_at",
        ]
