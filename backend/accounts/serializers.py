from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from doctors.models import Doctor
from patients.models import Patient

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role", "date_joined"]
        read_only_fields = fields


class DoctorRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(max_length=255)
    specialization = serializers.CharField(max_length=255)
    years_of_experience = serializers.IntegerField(min_value=0)
    availability_schedule = serializers.JSONField(required=False)

    def create(self, validated_data):
        availability_schedule = validated_data.pop("availability_schedule", {})
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=email,
            password=password,
            role=User.Role.DOCTOR,
            is_active=True,
        )
        Doctor.objects.create(user=user, availability_schedule=availability_schedule, **validated_data)
        return user

    def to_representation(self, instance):
        doctor = instance.doctor_profile
        return {
            "id": doctor.id,
            "email": instance.email,
            "role": instance.role,
            "name": doctor.name,
            "specialization": doctor.specialization,
            "years_of_experience": doctor.years_of_experience,
            "availability_schedule": doctor.availability_schedule,
        }


class PatientRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(max_length=255)
    age = serializers.IntegerField(min_value=0)
    gender = serializers.CharField(max_length=50)
    contact_info = serializers.JSONField(required=False)

    def create(self, validated_data):
        contact_info = validated_data.pop("contact_info", {})
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=email,
            password=password,
            role=User.Role.PATIENT,
            is_active=True,
        )
        Patient.objects.create(user=user, contact_info=contact_info, **validated_data)
        return user

    def to_representation(self, instance):
        patient = instance.patient_profile
        return {
            "id": patient.id,
            "email": instance.email,
            "role": instance.role,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "contact_info": patient.contact_info,
        }


class DoctorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "email",
            "name",
            "specialization",
            "years_of_experience",
            "availability_schedule",
            "password",
            "user",
        ]
        read_only_fields = ["user", "id"]

    def create(self, validated_data):
        email = validated_data.pop("user").get("email") if "user" in validated_data else validated_data.pop("email", None)
        password = validated_data.pop("password", None)
        if not email:
            raise serializers.ValidationError({"email": "This field is required."})
        if not password:
            raise serializers.ValidationError({"password": "This field is required."})
        validate_password(password)
        user = User.objects.create_user(email=email, password=password, role=User.Role.DOCTOR)
        return Doctor.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        email = validated_data.pop("user", {}).get("email") if "user" in validated_data else validated_data.pop("email", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if email:
            instance.user.email = email
        if password:
            validate_password(password)
            instance.user.set_password(password)
        if email or password:
            instance.user.save()
        return instance

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["email"] = instance.user.email
        return ret


class PatientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Patient
        fields = [
            "id",
            "email",
            "name",
            "age",
            "gender",
            "contact_info",
            "password",
            "user",
        ]
        read_only_fields = ["user", "id"]

    def create(self, validated_data):
        email = validated_data.pop("user").get("email") if "user" in validated_data else validated_data.pop("email", None)
        password = validated_data.pop("password", None)
        if not email:
            raise serializers.ValidationError({"email": "This field is required."})
        if not password:
            raise serializers.ValidationError({"password": "This field is required."})
        validate_password(password)
        user = User.objects.create_user(email=email, password=password, role=User.Role.PATIENT)
        return Patient.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        email = validated_data.pop("user", {}).get("email") if "user" in validated_data else validated_data.pop("email", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if email:
            instance.user.email = email
        if password:
            validate_password(password)
            instance.user.set_password(password)
        if email or password:
            instance.user.save()
        return instance

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["email"] = instance.user.email
        return ret


class MeSerializer(serializers.Serializer):
    user = UserSerializer()
    profile_id = serializers.IntegerField(allow_null=True)
