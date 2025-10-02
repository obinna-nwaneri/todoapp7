from __future__ import annotations

from datetime import datetime, time, timedelta

from django.utils import timezone
from rest_framework import serializers

from core.utils import get_cancellation_window_hours, notify_user, record_audit
from doctors.models import Doctor, TimeBlock
from patients.models import Patient

from .models import Appointment


def parse_time(value: str) -> time:
    return datetime.strptime(value, "%H:%M").time()


def is_within_availability(doctor: Doctor, start_at) -> bool:
    rules = doctor.availability_rule or []
    if not rules:
        return False
    weekday = start_at.weekday()
    start_time = start_at.time()
    for rule in rules:
        if "weekday" in rule and int(rule["weekday"]) == weekday:
            rule_start = parse_time(rule["start"])
            rule_end = parse_time(rule["end"])
            if rule_start <= start_time < rule_end:
                return True
        if "slots" in rule:
            for slot in rule["slots"]:
                try:
                    slot_dt = datetime.fromisoformat(slot)
                except ValueError:
                    continue
                if timezone.make_aware(slot_dt) == start_at:
                    return True
    return False


def is_blocked(doctor: Doctor, start_at) -> bool:
    return TimeBlock.objects.filter(doctor=doctor, start_at__lte=start_at, end_at__gt=start_at).exists()


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    patient_email = serializers.EmailField(source="patient.user.email", read_only=True)
    doctor_email = serializers.EmailField(source="doctor.user.email", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_name",
            "doctor_email",
            "patient",
            "patient_name",
            "patient_email",
            "start_at",
            "symptoms",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "notes", "created_at", "updated_at", "doctor", "patient"]


class AdminAppointmentSerializer(AppointmentSerializer):
    class Meta(AppointmentSerializer.Meta):
        read_only_fields = ["created_at", "updated_at"]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["doctor", "start_at", "symptoms"]

    def validate_symptoms(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Symptoms must be at least 10 characters")
        return value

    def validate(self, attrs):
        doctor: Doctor = attrs["doctor"]
        start_at = attrs["start_at"]
        if start_at < timezone.now():
            raise serializers.ValidationError({"start_at": "Start time cannot be in the past"})
        start_at = timezone.make_aware(start_at) if timezone.is_naive(start_at) else start_at
        attrs["start_at"] = start_at
        if not is_within_availability(doctor, start_at):
            raise serializers.ValidationError({"start_at": "Selected time outside doctor availability"})
        if is_blocked(doctor, start_at):
            raise serializers.ValidationError({"start_at": "Selected time is blocked"})
        if Appointment.objects.filter(doctor=doctor, start_at=start_at).exists():
            raise serializers.ValidationError({"start_at": "Slot already booked"})
        return attrs

    def create(self, validated_data):
        patient: Patient = self.context["patient"]
        appointment = Appointment.objects.create(patient=patient, **validated_data)
        record_audit("appointment_created", "Appointment", appointment.id)
        notify_user(
            appointment.doctor.user,
            "New appointment request",
            f"New appointment from {patient.name} at {appointment.start_at}",
        )
        notify_user(
            patient.user,
            "Appointment booked",
            f"Appointment with Dr. {appointment.doctor.name} submitted for approval.",
        )
        return appointment


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["start_at", "symptoms"]

    def validate(self, attrs):
        appointment: Appointment = self.instance
        if appointment.status != Appointment.Status.PENDING:
            raise serializers.ValidationError("Only pending appointments can be updated")
        new_start = attrs.get("start_at", appointment.start_at)
        new_symptoms = attrs.get("symptoms", appointment.symptoms)
        if len(new_symptoms.strip()) < 10:
            raise serializers.ValidationError({"symptoms": "Symptoms must be at least 10 characters"})
        if new_start < timezone.now():
            raise serializers.ValidationError({"start_at": "Start time cannot be in the past"})
        new_start = timezone.make_aware(new_start) if timezone.is_naive(new_start) else new_start
        if new_start != appointment.start_at:
            if not is_within_availability(appointment.doctor, new_start):
                raise serializers.ValidationError({"start_at": "Outside availability"})
            if is_blocked(appointment.doctor, new_start):
                raise serializers.ValidationError({"start_at": "Selected time blocked"})
            if Appointment.objects.filter(doctor=appointment.doctor, start_at=new_start).exclude(
                pk=appointment.pk
            ).exists():
                raise serializers.ValidationError({"start_at": "Slot already booked"})
        attrs["start_at"] = new_start
        return attrs

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        record_audit("appointment_updated", "Appointment", instance.id)
        return instance


class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["status", "notes"]

    def validate(self, attrs):
        appointment: Appointment = self.instance
        new_status = attrs.get("status")
        if new_status not in Appointment.Status.values:
            raise serializers.ValidationError({"status": "Invalid status"})
        current = appointment.status
        allowed = {
            Appointment.Status.PENDING: {
                Appointment.Status.APPROVED,
                Appointment.Status.REJECTED,
                Appointment.Status.CANCELLED,
            },
            Appointment.Status.APPROVED: {
                Appointment.Status.COMPLETED,
                Appointment.Status.CANCELLED,
            },
        }
        if current not in allowed or new_status not in allowed.get(current, set()):
            raise serializers.ValidationError({"status": "Status transition not allowed"})
        return attrs

    def update(self, instance, validated_data):
        previous_status = instance.status
        instance.status = validated_data.get("status", instance.status)
        instance.notes = validated_data.get("notes", instance.notes)
        instance.save(update_fields=["status", "notes", "updated_at"])
        record_audit(
            "appointment_status_changed",
            "Appointment",
            instance.id,
            diff={"from": previous_status, "to": instance.status},
        )
        notify_user(
            instance.patient.user,
            "Appointment status updated",
            f"Your appointment with Dr. {instance.doctor.name} is now {instance.status}",
        )
        return instance


class AppointmentCancelSerializer(serializers.Serializer):
    def validate(self, attrs):
        appointment: Appointment = self.context["appointment"]
        if appointment.status not in {
            Appointment.Status.PENDING,
            Appointment.Status.APPROVED,
        }:
            raise serializers.ValidationError("Cannot cancel this appointment")
        if appointment.status == Appointment.Status.APPROVED:
            window_hours = get_cancellation_window_hours()
            if appointment.start_at - timezone.now() < timedelta(hours=window_hours):
                raise serializers.ValidationError("Cancellation window has passed")
        return attrs

    def save(self, **kwargs):
        appointment: Appointment = self.context["appointment"]
        previous_status = appointment.status
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status", "updated_at"])
        record_audit(
            "appointment_cancelled",
            "Appointment",
            appointment.id,
            diff={"from": previous_status, "to": appointment.status},
        )
        notify_user(
            appointment.doctor.user,
            "Appointment cancelled",
            f"Appointment with {appointment.patient.name} was cancelled.",
        )
        notify_user(
            appointment.patient.user,
            "Appointment cancelled",
            "Your appointment has been cancelled.",
        )
        return appointment
