from __future__ import annotations

from datetime import datetime, timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from appointments.models import Appointment
from core.utils import send_notification
from doctors.models import Doctor, TimeBlock


def _is_within_availability(doctor: Doctor, start_at) -> bool:
    if not doctor.availability_rule:
        return False
    weekday = start_at.strftime("%A").lower()
    rules = doctor.availability_rule or {}
    slots = rules.get(weekday, [])
    if not isinstance(slots, list):
        return False
    start_time = start_at.time()
    duration_minutes = getattr(settings, "DEFAULT_APPOINTMENT_DURATION_MINUTES", 30)
    end_dt = datetime.combine(start_at.date(), start_time) + timedelta(minutes=duration_minutes)
    end_time = end_dt.time()
    for slot in slots:
        try:
            slot_start = datetime.strptime(slot["start"], "%H:%M").time()
            slot_end = datetime.strptime(slot["end"], "%H:%M").time()
        except Exception:  # pragma: no cover - defensive
            continue
        if slot_start <= start_time < slot_end and end_time <= slot_end:
            return True
    return False


def _overlaps_time_block(doctor: Doctor, start_at, end_at) -> bool:
    return TimeBlock.objects.filter(doctor=doctor, start_at__lt=end_at, end_at__gt=start_at).exists()


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    patient_name = serializers.CharField(source="patient.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "start_at",
            "end_at",
            "symptoms",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["patient_name", "doctor_name", "created_at", "updated_at", "end_at"]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "doctor", "start_at", "symptoms"]

    def validate(self, attrs):
        request = self.context["request"]
        patient = request.user.patient_profile
        doctor: Doctor = attrs["doctor"]
        start_at = attrs["start_at"]
        now = timezone.now()
        if start_at < now:
            raise serializers.ValidationError("Appointment cannot be in the past")
        if not patient:
            raise serializers.ValidationError("Patient profile required")
        if not attrs.get("symptoms") or len(attrs["symptoms"].strip()) < 10:
            raise serializers.ValidationError({"symptoms": "Please provide symptoms (min 10 characters)."})
        if not _is_within_availability(doctor, start_at):
            raise serializers.ValidationError({"start_at": "Selected slot outside doctor availability."})
        duration = timedelta(minutes=getattr(settings, "DEFAULT_APPOINTMENT_DURATION_MINUTES", 30))
        end_at = start_at + duration
        if _overlaps_time_block(doctor, start_at, end_at):
            raise serializers.ValidationError({"start_at": "Selected slot is blocked."})
        if Appointment.objects.filter(doctor=doctor, start_at=start_at).exists():
            raise serializers.ValidationError({"start_at": "Slot already booked."})
        attrs["patient"] = patient
        attrs["end_at"] = end_at
        return attrs

    def create(self, validated_data):
        appointment = super().create(validated_data)
        send_notification(
            [appointment.patient.user.email],
            "Appointment booked",
            f"Your appointment with {appointment.doctor.name} is pending confirmation.",
        )
        send_notification(
            [appointment.doctor.user.email],
            "New appointment request",
            f"A patient requested an appointment on {appointment.start_at}.",
        )
        return appointment


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "start_at", "symptoms", "status"]
        read_only_fields = ["status"]

    def validate(self, attrs):
        appointment: Appointment = self.instance
        if appointment.status != Appointment.Status.PENDING:
            raise serializers.ValidationError("Only pending appointments can be modified")
        cancellation_window = getattr(settings, "CANCELLATION_WINDOW_HOURS", 4)
        if appointment.start_at - timezone.now() < timedelta(hours=cancellation_window):
            raise serializers.ValidationError("Too late to modify appointment")
        start_at = attrs.get("start_at", appointment.start_at)
        if start_at < timezone.now():
            raise serializers.ValidationError({"start_at": "Appointment cannot be in the past"})
        doctor = appointment.doctor
        if not _is_within_availability(doctor, start_at):
            raise serializers.ValidationError({"start_at": "Selected slot outside doctor availability."})
        duration = timedelta(minutes=getattr(settings, "DEFAULT_APPOINTMENT_DURATION_MINUTES", 30))
        end_at = start_at + duration
        if Appointment.objects.exclude(id=appointment.id).filter(doctor=doctor, start_at=start_at).exists():
            raise serializers.ValidationError({"start_at": "Slot already booked."})
        if _overlaps_time_block(doctor, start_at, end_at):
            raise serializers.ValidationError({"start_at": "Selected slot is blocked."})
        symptoms = attrs.get("symptoms", appointment.symptoms)
        if not symptoms or len(symptoms.strip()) < 10:
            raise serializers.ValidationError({"symptoms": "Please provide symptoms (min 10 characters)."})
        attrs["end_at"] = end_at
        return attrs


class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id", "status"]

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data["status"]
        instance.status = new_status
        instance.save(update_fields=["status", "updated_at"])
        send_notification(
            [instance.patient.user.email],
            "Appointment status update",
            f"Your appointment on {instance.start_at} is now {new_status}.",
        )
        if old_status != new_status:
            send_notification(
                [instance.doctor.user.email],
                "Appointment status changed",
                f"Status for appointment with {instance.patient.name} is now {new_status}.",
            )
        return instance
