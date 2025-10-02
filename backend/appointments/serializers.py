from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from .models import Appointment, Doctor

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "password", "first_name", "last_name")

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.get("email")
        validated_data.setdefault("username", email)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")
        read_only_fields = ("email",)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Incorrect password."})
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ("id", "name", "specialization", "availability_schedule")


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), write_only=True, source="doctor"
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Appointment
        fields = (
            "id",
            "doctor",
            "doctor_id",
            "date",
            "time",
            "symptoms",
            "status",
            "status_display",
            "created_at",
        )
        read_only_fields = ("status", "created_at")

    def validate(self, attrs):
        request = self.context["request"]
        doctor = attrs.get("doctor")
        date = attrs.get("date")
        time = attrs.get("time")

        today = timezone.localdate()
        now_time = timezone.localtime().time()
        if date < today or (date == today and time <= now_time):
            raise serializers.ValidationError(
                "Please choose a future date and time for your appointment."
            )

        conflict_exists = Appointment.objects.filter(
            doctor=doctor, date=date, time=time
        ).exclude(status=Appointment.Status.REJECTED)
        if conflict_exists.exists():
            raise serializers.ValidationError(
                "This appointment slot is already booked or awaiting approval. Please choose another time."
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        return Appointment.objects.create(patient=request.user, **validated_data)


class AdminAppointmentSerializer(serializers.ModelSerializer):
    patient = ProfileSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = (
            "id",
            "patient",
            "doctor",
            "date",
            "time",
            "symptoms",
            "status",
            "created_at",
        )
