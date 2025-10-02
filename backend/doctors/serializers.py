from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Doctor

User = get_user_model()


class DoctorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.DOCTOR), required=False, allow_null=True
    )
    new_email = serializers.EmailField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Doctor
        fields = (
            'id',
            'user',
            'email',
            'new_email',
            'new_password',
            'name',
            'specialization',
            'years_of_experience',
            'availability_schedule',
        )

    def validate(self, attrs):
        user = attrs.get('user')
        new_email = attrs.get('new_email')
        new_password = attrs.get('new_password')
        if not self.instance and not user and not new_email:
            raise serializers.ValidationError('Provide either an existing doctor user or new_email/new_password.')
        if new_email:
            existing = User.objects.filter(email=new_email)
            if self.instance and getattr(self.instance, 'user', None):
                existing = existing.exclude(pk=self.instance.user.pk)
            if existing.exists():
                raise serializers.ValidationError({'new_email': 'This email is already in use.'})
        if new_email and not new_password:
            raise serializers.ValidationError({'new_password': 'Password is required when providing a new email.'})
        return attrs

    def create(self, validated_data):
        new_email = validated_data.pop('new_email', None)
        new_password = validated_data.pop('new_password', None)
        user = validated_data.pop('user', None)
        if user is None:
            user = User.objects.create_user(
                email=new_email,
                password=new_password,
                role=User.Role.DOCTOR,
                is_staff=False,
            )
        return Doctor.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('new_email', None)
        validated_data.pop('new_password', None)
        validated_data.pop('user', None)
        return super().update(instance, validated_data)


class DoctorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Doctor
        fields = (
            'id',
            'email',
            'name',
            'specialization',
            'years_of_experience',
            'availability_schedule',
        )
        read_only_fields = ('id', 'email')
