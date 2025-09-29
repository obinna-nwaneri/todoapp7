from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "due_date",
            "priority",
            "status",
            "created_at",
            "updated_at",
            "owner",
        ]
        read_only_fields = ("id", "created_at", "updated_at", "owner")

    def get_owner(self, obj):
        return {
            "id": obj.owner_id,
            "username": obj.owner.username,
        }

    def validate_priority(self, value):
        if value not in dict(Task.PRIORITY_CHOICES):
            raise serializers.ValidationError("Invalid priority")
        return value

    def validate_status(self, value):
        if value not in dict(Task.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        return Task.objects.create(owner=request.user, **validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("owner", None)
        return super().update(instance, validated_data)
