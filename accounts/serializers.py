from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers

from core.utils import ensure_notification_pref, record_audit
from doctors.models import Doctor
from patients.models import Patient

User = get_user_model()


class NotificationPreferenceSerializer(serializers.Serializer):
    email_enabled = serializers.BooleanField()
    sms_enabled = serializers.BooleanField()
    push_enabled = serializers.BooleanField()


class UserSerializer(serializers.ModelSerializer):
    preferences = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "role", "is_active", "date_joined", "preferences"]

    def get_preferences(self, obj):
        prefs = getattr(obj, "notificationpreference", None)
        if not prefs:
            ensure_notification_pref(obj)
            prefs = obj.notificationpreference
        return NotificationPreferenceSerializer(
            {"email_enabled": prefs.email_enabled, "sms_enabled": prefs.sms_enabled, "push_enabled": prefs.push_enabled}
        ).data


class RegisterDoctorSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(max_length=255)
    specialization = serializers.CharField(max_length=255)
    years_experience = serializers.IntegerField(min_value=0)
    bio = serializers.CharField(allow_blank=True, required=False)
    contact_info = serializers.CharField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        doctor_fields = {
            "name": validated_data.pop("name"),
            "specialization": validated_data.pop("specialization"),
            "years_experience": validated_data.pop("years_experience"),
            "bio": validated_data.pop("bio", ""),
            "contact_info": validated_data.pop("contact_info"),
        }
        user = User.objects.create_user(role=User.Role.DOCTOR, password=password, **validated_data)
        Doctor.objects.create(user=user, **doctor_fields)
        record_audit("register_doctor", "User", user.id)
        return user


class RegisterPatientSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(max_length=255)
    age = serializers.IntegerField(min_value=0)
    gender = serializers.CharField(max_length=32)
    contact_info = serializers.CharField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        patient_fields = {
            "name": validated_data.pop("name"),
            "age": validated_data.pop("age"),
            "gender": validated_data.pop("gender"),
            "contact_info": validated_data.pop("contact_info"),
        }
        user = User.objects.create_user(role=User.Role.PATIENT, password=password, **validated_data)
        Patient.objects.create(user=user, **patient_fields)
        record_audit("register_patient", "User", user.id)
        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value

    def save(self, **kwargs):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_link = f"{kwargs.get('base_url', '')}?uid={uid}&token={token}"
        from core.utils import notify_user

        notify_user(user, "Password reset", f"Use this link to reset your password: {reset_link}")
        record_audit("password_reset_requested", "User", user.id)
        return {"uid": uid, "token": token}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        token_generator = PasswordResetTokenGenerator()
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (ValueError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid token")
        if not token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError("Invalid or expired token")
        validate_password(attrs["new_password"], user)
        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        record_audit("password_reset_completed", "User", user.id)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Invalid password"})
        validate_password(attrs["new_password"], user)
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        record_audit("password_changed", "User", user.id)
        return user
