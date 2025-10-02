from datetime import date

from rest_framework import serializers

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'date',
            'time',
            'symptoms',
            'status',
            'created_at',
        )
        read_only_fields = ('created_at',)

    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError('Appointment date cannot be in the past.')
        return value

    def validate_symptoms(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Symptoms description must be at least 10 characters long.')
        return value
