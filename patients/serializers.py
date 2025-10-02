from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import User
from core.utils import record_audit

from .models import Patient

UserModel = get_user_model()


class PatientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Patient
        fields = ["id", "email", "name", "age", "gender", "contact_info"]


class PatientAdminSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = Patient
        fields = ["id", "email", "name", "age", "gender", "contact_info"]

    def validate_email(self, value):
        if not UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError("Related user does not exist")
        return value

    def create(self, validated_data):
        email = validated_data.pop("user")["email"]
        user = UserModel.objects.get(email=email)
        if user.role != User.Role.PATIENT:
            user.role = User.Role.PATIENT
            user.save(update_fields=["role"])
        patient = Patient.objects.create(user=user, **validated_data)
        record_audit("admin_create_patient", "Patient", patient.id)
        return patient

    def update(self, instance, validated_data):
        validated_data.pop("user", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        record_audit("admin_update_patient", "Patient", instance.id)
        return instance
