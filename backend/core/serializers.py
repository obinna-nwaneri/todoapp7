from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Doctor, Patient, Appointment, User

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "password", "first_name", "last_name", "role"]
        read_only_fields = ["id", "role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
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

    def create(self, validated_data):
        user = validated_data["user"]
        if user.role != User.Roles.DOCTOR:
            user.role = User.Roles.DOCTOR
            user.save(update_fields=["role"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = validated_data.get("user")
        if user and user.role != User.Roles.DOCTOR:
            user.role = User.Roles.DOCTOR
            user.save(update_fields=["role"])
        return super().update(instance, validated_data)


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user", write_only=True
    )

    class Meta:
        model = Patient
        fields = ["id", "user", "user_id", "name", "age", "gender", "contact_info"]

    def create(self, validated_data):
        user = validated_data["user"]
        if user.role != User.Roles.PATIENT:
            user.role = User.Roles.PATIENT
            user.save(update_fields=["role"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = validated_data.get("user")
        if user and user.role != User.Roles.PATIENT:
            user.role = User.Roles.PATIENT
            user.save(update_fields=["role"])
        return super().update(instance, validated_data)


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
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "status"]


class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["status"]


class DoctorRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField()
    specialization = serializers.CharField()
    years_of_experience = serializers.IntegerField(min_value=0)
    availability_schedule = serializers.CharField()

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        user = User.objects.create(
            email=email,
            role=User.Roles.DOCTOR,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save()
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor


class PatientRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField()
    age = serializers.IntegerField(min_value=0)
    gender = serializers.CharField()
    contact_info = serializers.CharField()

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        user = User.objects.create(
            email=email,
            role=User.Roles.PATIENT,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save()
        patient = Patient.objects.create(user=user, **validated_data)
        return patient
