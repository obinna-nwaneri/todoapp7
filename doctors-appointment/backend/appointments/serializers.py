from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty

User = get_user_model()


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class ProfileSerializer(serializers.ModelSerializer[Profile]):
    class Meta:
        model = Profile
        fields = ["role", "phone", "gender"]


class SpecialtySerializer(serializers.ModelSerializer[Specialty]):
    class Meta:
        model = Specialty
        fields = ["id", "name", "slug"]


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


class PatientSerializer(serializers.ModelSerializer[Patient]):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ["id", "user", "dob", "address"]


class AvailabilitySerializer(serializers.ModelSerializer[Availability]):
    class Meta:
        model = Availability
        fields = ["id", "doctor", "weekday", "start_time", "end_time", "slot_minutes"]
        read_only_fields = ["doctor"]


class AppointmentSerializer(serializers.ModelSerializer[Appointment]):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(source="doctor", queryset=Doctor.objects.all(), write_only=True)
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(source="patient", queryset=Patient.objects.all(), required=False, write_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_id",
            "patient",
            "patient_id",
            "date",
            "start_time",
            "end_time",
            "reason",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "created_at", "updated_at", "doctor", "patient"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        doctor: Doctor | None = attrs.get("doctor") or (self.instance.doctor if self.instance else None)  # type: ignore[assignment]
        date = attrs.get("date", getattr(self.instance, "date", None))
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))

        if request and user and hasattr(user, "profile"):
            if user.profile.role == Profile.Role.PATIENT:
                if hasattr(user, "patient"):
                    attrs["patient"] = user.patient
                else:
                    raise serializers.ValidationError("Patient profile not found.")
            elif user.profile.role == Profile.Role.DOCTOR:
                if doctor and hasattr(user, "doctor") and doctor != user.doctor:
                    raise serializers.ValidationError("Doctors can only manage their own appointments.")

        if doctor and date and start_time and end_time:
            temp_instance = Appointment(
                doctor=doctor,
                patient=attrs.get("patient") or getattr(self.instance, "patient", None),
                date=date,
                start_time=start_time,
                end_time=end_time,
            )
            if self.instance:
                temp_instance.pk = self.instance.pk
            temp_instance.full_clean()
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and hasattr(user, "profile") and user.profile.role == Profile.Role.PATIENT:
            validated_data["patient"] = user.patient
        if "patient" not in validated_data or validated_data["patient"] is None:
            raise serializers.ValidationError("Patient must be provided.")
        validated_data.setdefault("status", Appointment.Status.PENDING)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # status changes handled elsewhere
        validated_data.pop("status", None)
        return super().update(instance, validated_data)
