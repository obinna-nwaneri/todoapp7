from __future__ import annotations

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import (
    Appointment,
    Availability,
    Doctor,
    Patient,
    Profile,
    Specialty,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "role", "phone", "gender"]


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "slug"]


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "user",
            "specialty",
            "clinic_name",
            "about",
            "consultation_fee",
            "is_active",
        ]


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ["id", "user", "dob", "address"]


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "doctor", "weekday", "start_time", "end_time", "slot_minutes"]
        read_only_fields = ("doctor",)


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)
    status = serializers.ChoiceField(choices=Appointment.Status.choices, default=Appointment.Status.PENDING, required=False)
    doctor_detail = DoctorSerializer(source="doctor", read_only=True)
    patient_detail = PatientSerializer(source="patient", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "patient",
            "doctor_detail",
            "patient_detail",
            "date",
            "start_time",
            "end_time",
            "reason",
            "status",
        ]
    def validate(self, attrs):
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start and end and start >= end:
            raise serializers.ValidationError("End time must be after start time")

        booking_date = attrs.get("date", getattr(self.instance, "date", None))
        status_value = attrs.get("status", getattr(self.instance, "status", Appointment.Status.PENDING))
        active_statuses = {Appointment.Status.PENDING, Appointment.Status.CONFIRMED}
        if booking_date and booking_date < timezone.localdate() and status_value in active_statuses:
            raise serializers.ValidationError("Cannot book appointments in the past")

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and hasattr(user, "profile") and user.profile.role == Profile.Role.PATIENT:
            try:
                patient = user.patient_profile
            except Patient.DoesNotExist as exc:  # pragma: no cover - should not happen
                raise serializers.ValidationError("Patient profile not found") from exc
            validated_data["patient"] = patient
        elif "patient" not in validated_data:
            raise serializers.ValidationError("Patient must be specified")

        validated_data.setdefault("status", Appointment.Status.PENDING)
        appointment = Appointment(**validated_data)
        try:
            appointment.full_clean()
        except ValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        appointment.save()
        return appointment

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        try:
            instance.full_clean()
        except ValidationError as exc:
            raise serializers.ValidationError(exc.message_dict) from exc
        instance.save()
        return instance
