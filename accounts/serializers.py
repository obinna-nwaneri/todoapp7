from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers

from core.utils import send_notification
from doctors.models import Doctor
from doctors.serializers import DoctorSerializer, DoctorWriteSerializer
from patients.models import Patient
from patients.serializers import PatientSerializer, PatientWriteSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "role", "is_active", "date_joined", "profile"]

    def get_profile(self, obj):
        if obj.role == User.Role.DOCTOR and hasattr(obj, "doctor_profile"):
            return DoctorSerializer(obj.doctor_profile).data
        if obj.role == User.Role.PATIENT and hasattr(obj, "patient_profile"):
            return PatientSerializer(obj.patient_profile).data
        return None


class DoctorRegistrationSerializer(DoctorWriteSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta(DoctorWriteSerializer.Meta):
        fields = ["email", "password"] + DoctorWriteSerializer.Meta.fields

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = User.objects.create_user(email=email, password=password, role=User.Role.DOCTOR)
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor


class PatientRegistrationSerializer(PatientWriteSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta(PatientWriteSerializer.Meta):
        fields = ["email", "password"] + PatientWriteSerializer.Meta.fields

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = User.objects.create_user(email=email, password=password, role=User.Role.PATIENT)
        patient = Patient.objects.create(user=user, **validated_data)
        return patient


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        email = self.validated_data["email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"/reset-password/{uid}/{token}/"
        send_notification([email], "Password reset", f"Reset your password using the link: {reset_link}")


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def save(self):
        uid = self.validated_data["uid"]
        token = self.validated_data["token"]
        new_password = self.validated_data["new_password"]
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (ValueError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset token")
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Invalid reset token")
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        if not user.check_password(self.validated_data["old_password"]):
            raise serializers.ValidationError({"old_password": "Incorrect password"})
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class ActivationSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()

    def save(self, user: User):
        user.is_active = self.validated_data["is_active"]
        user.save(update_fields=["is_active"])
        return user
