from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Appointment, Doctor, Patient

User = get_user_model()


class NestedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role", "first_name", "last_name"]
        read_only_fields = fields


class DoctorSerializer(serializers.ModelSerializer):
    user = NestedUserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "user",
            "user_id",
            "name",
            "specialization",
            "years_of_experience",
            "availability_schedule",
        ]


class PatientSerializer(serializers.ModelSerializer):
    user = NestedUserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )

    class Meta:
        model = Patient
        fields = ["id", "user", "user_id", "name", "age", "gender", "contact_info"]


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source="doctor", write_only=True
    )
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), source="patient", write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_id",
            "doctor",
            "doctor_id",
            "date",
            "time",
            "symptoms",
            "status",
        ]
