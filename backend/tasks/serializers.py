from django.contrib.auth import get_user_model
from rest_framework import serializers

from tasks.models import Task

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
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
        read_only_fields = ["id", "owner", "owner_username", "created_at", "updated_at"]


class AdminTaskSerializer(TaskSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta(TaskSerializer.Meta):
        read_only_fields = ["id", "owner_username", "created_at", "updated_at"]
