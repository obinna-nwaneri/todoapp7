from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from .models import Appointment, Doctor


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id", "name", "specialization", "availability_schedule"]


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source="doctor", write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_id",
            "date",
            "time",
            "symptoms",
            "status",
            "created_at",
        ]
        read_only_fields = ["status", "created_at", "doctor"]

    def validate(self, attrs):
        request = self.context["request"]
        doctor = attrs["doctor"]
        date = attrs["date"]
        time = attrs["time"]

        # Ensure date/time are not in the past
        appointment_dt = datetime.combine(date, time)
        if appointment_dt < timezone.now().replace(tzinfo=None):
            raise serializers.ValidationError("Cannot book appointments in the past.")

        conflict_exists = Appointment.objects.filter(
            doctor=doctor, date=date, time=time
        ).exclude(status=Appointment.Status.REJECTED)
        if self.instance:
            conflict_exists = conflict_exists.exclude(pk=self.instance.pk)
        if conflict_exists.exists():
            raise serializers.ValidationError(
                "Selected doctor is not available at the chosen date and time."
            )
        attrs["patient"] = request.user
        return attrs


class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["status"]


class AdminAppointmentSerializer(serializers.ModelSerializer):
    patient_email = serializers.EmailField(source="patient.email", read_only=True)
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient_email",
            "doctor_name",
            "date",
            "time",
            "symptoms",
            "status",
        ]


class AppointmentHistorySerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ["id", "doctor", "date", "time", "symptoms", "status", "created_at"]
