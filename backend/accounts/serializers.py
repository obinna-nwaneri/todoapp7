from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from doctors.models import Doctor
from patients.models import Patient

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    doctor_profile_id = serializers.IntegerField(source='doctor_profile.id', read_only=True)
    patient_profile_id = serializers.IntegerField(source='patient_profile.id', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'date_joined', 'doctor_profile_id', 'patient_profile_id')


class DoctorRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(max_length=255)
    specialization = serializers.CharField(max_length=255)
    years_of_experience = serializers.IntegerField(min_value=0)
    availability_schedule = serializers.JSONField(required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        availability = validated_data.pop('availability_schedule', {})
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.DOCTOR,
            is_staff=False,
        )
        Doctor.objects.create(
            user=user,
            name=validated_data['name'],
            specialization=validated_data['specialization'],
            years_of_experience=validated_data['years_of_experience'],
            availability_schedule=availability,
        )
        return user


class PatientRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(max_length=255)
    age = serializers.IntegerField(min_value=0)
    gender = serializers.CharField(max_length=50)
    contact_info = serializers.JSONField(required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        contact = validated_data.pop('contact_info', {})
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.PATIENT,
            is_staff=False,
        )
        Patient.objects.create(
            user=user,
            name=validated_data['name'],
            age=validated_data['age'],
            gender=validated_data['gender'],
            contact_info=contact,
        )
        return user
