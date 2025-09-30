from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Task


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = get_user_model()
        fields = ("id", "username", "email", "password", "is_staff")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = get_user_model().objects.create_user(password=password, **validated_data)
        return user

    def validate_password(self, value):
        validate_password(value)
        return value


class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    assigned_user = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=get_user_model().objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "due_date",
            "priority",
            "status",
            "user",
            "user_id",
            "assigned_user",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "user_id", "created_at", "updated_at")

    def validate(self, attrs):
        request = self.context.get("request")
        if request and not request.user.is_staff and "user" in attrs:
            attrs.pop("user")
        return super().validate(attrs)
