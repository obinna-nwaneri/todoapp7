from __future__ import annotations

from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import serializers
from doctors.models import Doctor
from patients.models import Patient

from .models import Appointment

User = get_user_model()


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    symptoms = serializers.CharField(min_length=10)
    doctor_detail = serializers.SerializerMethodField(read_only=True)
    patient_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "date",
            "time",
            "symptoms",
            "status",
            "created_at",
            "doctor_detail",
            "patient_detail",
        ]
        read_only_fields = ["created_at"]

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if not attrs.get("patient") and not self.instance:
            if not request or not getattr(request.user, "is_authenticated", False):
                raise serializers.ValidationError({"patient": "This field is required."})
            if request.user.role != User.Role.PATIENT:
                raise serializers.ValidationError({"patient": "This field is required."})
        doctor = attrs.get("doctor")
        date_value = attrs.get("date")
        time_value = attrs.get("time")
        if doctor and date_value and time_value:
            existing_qs = Appointment.objects.filter(doctor=doctor, date=date_value, time=time_value)
            if self.instance:
                existing_qs = existing_qs.exclude(pk=self.instance.pk)
            if existing_qs.exists():
                raise serializers.ValidationError("Doctor already has an appointment at the selected time.")
        return attrs

    def get_doctor_detail(self, obj):
        return {
            "id": obj.doctor.id,
            "name": obj.doctor.name,
            "specialization": obj.doctor.specialization,
        }

    def get_patient_detail(self, obj):
        return {
            "id": obj.patient.id,
            "name": obj.patient.name,
            "email": obj.patient.user.email,
        }
