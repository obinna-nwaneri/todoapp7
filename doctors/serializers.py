from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer
from accounts.models import User
from core.utils import record_audit

from .models import Doctor, TimeBlock


class AvailabilityRuleField(serializers.JSONField):
    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        if not isinstance(data, list):
            raise serializers.ValidationError("Availability must be a list")
        for item in data:
            if "weekday" not in item or "start" not in item or "end" not in item:
                raise serializers.ValidationError(
                    "Each availability entry requires weekday, start, and end"
                )
        return data


class DoctorSerializer(serializers.ModelSerializer):
    availability_rule = AvailabilityRuleField(required=False)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "email",
            "name",
            "specialization",
            "years_experience",
            "bio",
            "contact_info",
            "availability_rule",
        ]


class DoctorAdminSerializer(serializers.ModelSerializer):
    availability_rule = AvailabilityRuleField(required=False)
    email = serializers.EmailField(write_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "email",
            "name",
            "specialization",
            "years_experience",
            "bio",
            "contact_info",
            "availability_rule",
            "role",
        ]

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Related user does not exist")
        return value

    def create(self, validated_data):
        email = validated_data.pop("user")["email"]
        user = User.objects.get(email=email)
        if user.role != User.Role.DOCTOR:
            user.role = User.Role.DOCTOR
            user.save(update_fields=["role"])
        doctor = Doctor.objects.create(user=user, **validated_data)
        record_audit("admin_create_doctor", "Doctor", doctor.id)
        return doctor

    def update(self, instance, validated_data):
        validated_data.pop("user", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        record_audit("admin_update_doctor", "Doctor", instance.id)
        return instance


class TimeBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeBlock
        fields = ["id", "doctor", "start_at", "end_at", "reason"]

    def validate(self, attrs):
        if attrs["end_at"] <= attrs["start_at"]:
            raise serializers.ValidationError("End time must be after start time")
        return attrs


class PublicDoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            "id",
            "name",
            "specialization",
            "years_experience",
            "bio",
            "contact_info",
            "availability_rule",
        ]
