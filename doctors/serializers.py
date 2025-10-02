from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Doctor, TimeBlock

User = get_user_model()


class DoctorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "email",
            "role",
            "name",
            "specialization",
            "years_experience",
            "bio",
            "contact_info",
            "availability_rule",
            "is_active",
        ]


class DoctorWriteSerializer(serializers.ModelSerializer):
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


class DoctorAdminSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "email",
            "password",
            "name",
            "specialization",
            "years_experience",
            "bio",
            "contact_info",
            "availability_rule",
            "is_active",
            "user_id",
        ]

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password", None) or User.objects.make_random_password()
        user = User.objects.create_user(email=email, password=password, role=User.Role.DOCTOR)
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor

    def update(self, instance, validated_data):
        email = validated_data.pop("email", None)
        password = validated_data.pop("password", None)
        if email and instance.user.email != email:
            instance.user.email = email
            instance.user.save(update_fields=["email"])
        if password:
            instance.user.set_password(password)
            instance.user.save(update_fields=["password"])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["email"] = instance.user.email
        rep["is_active"] = instance.user.is_active
        rep["user_id"] = instance.user.id
        rep.pop("password", None)
        return rep


class TimeBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeBlock
        fields = ["id", "doctor", "start_at", "end_at", "reason"]


class PublicDoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id", "name", "specialization", "years_experience", "bio", "contact_info", "availability_rule"]
