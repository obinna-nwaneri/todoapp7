"""Serializers for API endpoints."""
from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty

User = get_user_model()


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]
        read_only_fields = ["id"]


class ProfileSerializer(serializers.ModelSerializer[Profile]):
    class Meta:
        model = Profile
        fields = ["role", "phone", "gender"]


class SpecialtySerializer(serializers.ModelSerializer[Specialty]):
    class Meta:
        model = Specialty
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "slug"]


class DoctorSerializer(serializers.ModelSerializer[Doctor]):
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
        read_only_fields = ["id", "user", "specialty"]


class PatientSerializer(serializers.ModelSerializer[Patient]):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ["id", "user", "dob", "address"]
        read_only_fields = ["id", "user"]


class AvailabilitySerializer(serializers.ModelSerializer[Availability]):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all(), required=False)

    class Meta:
        model = Availability
        fields = ["id", "doctor", "weekday", "start_time", "end_time", "slot_minutes"]
        read_only_fields = ["id"]


class AppointmentSerializer(serializers.ModelSerializer[Appointment]):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "patient",
            "date",
            "start_time",
            "end_time",
            "reason",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        role = getattr(getattr(user, "profile", None), "role", None)

        if self.instance is None:
            if role == Profile.Role.PATIENT:
                attrs["patient"] = getattr(user, "patient_profile", None)
            patient = attrs.get("patient")
            if patient is None:
                raise serializers.ValidationError({"patient": "Patient is required."})
            status = attrs.get("status", Appointment.Status.PENDING)
            if status != Appointment.Status.PENDING:
                raise serializers.ValidationError({"status": "New bookings must start as pending."})
        else:
            patient = attrs.get("patient", self.instance.patient)
            status = attrs.get("status", self.instance.status)
            attrs["patient"] = patient

        doctor = attrs.get("doctor", getattr(self.instance, "doctor", None))
        date = attrs.get("date", getattr(self.instance, "date", None))
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))

        appointment = Appointment(
            doctor=doctor,
            patient=patient,
            date=date,
            start_time=start_time,
            end_time=end_time,
            reason=attrs.get("reason", getattr(self.instance, "reason", "")),
            status=status,
        )
        if self.instance is not None:
            appointment.pk = self.instance.pk
            appointment._state.adding = False
        try:
            appointment.full_clean()
        except ValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        if self.instance is not None:
            self._validate_status_transition(self.instance.status, status, user)
        return attrs

    def _validate_status_transition(self, current: str, new: str, user: Any) -> None:
        if current == new:
            return
        role = getattr(getattr(user, "profile", None), "role", None)
        doctor_profile = getattr(user, "doctor_profile", None)
        allowed = False
        if role == Profile.Role.ADMIN:
            allowed = True
        elif role == Profile.Role.DOCTOR and doctor_profile == self.instance.doctor:
            if current == Appointment.Status.PENDING and new == Appointment.Status.CONFIRMED:
                allowed = True
            elif current == Appointment.Status.CONFIRMED and new == Appointment.Status.COMPLETED:
                allowed = True
            elif current in {Appointment.Status.PENDING, Appointment.Status.CONFIRMED} and new == Appointment.Status.CANCELLED:
                allowed = True
        elif role == Profile.Role.PATIENT and self.instance.patient == getattr(user, "patient_profile", None):
            if current in {Appointment.Status.PENDING, Appointment.Status.CONFIRMED} and new == Appointment.Status.CANCELLED:
                allowed = True
        if not allowed:
            raise serializers.ValidationError({"status": "Invalid status transition for your role."})

    def create(self, validated_data: dict[str, Any]) -> Appointment:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if getattr(getattr(user, "profile", None), "role", None) == Profile.Role.PATIENT:
            validated_data["patient"] = getattr(user, "patient_profile")
        appointment = Appointment.objects.create(**validated_data)
        return appointment

    def update(self, instance: Appointment, validated_data: dict[str, Any]) -> Appointment:
        for field in ["doctor", "patient", "date", "start_time", "end_time", "reason", "status"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance
