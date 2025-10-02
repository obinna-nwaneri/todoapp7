from __future__ import annotations

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import exceptions, filters, permissions, viewsets

from accounts.permissions import IsAdminRole, IsDoctorRole, IsPatientRole
from doctors.models import Doctor
from patients.models import Patient

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient__user", "doctor__user")
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "doctor", "patient", "date"]
    search_fields = ["symptoms", "doctor__user__email", "patient__user__email"]
    ordering_fields = ["date", "time", "status", "created_at"]


class DoctorAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "date", "patient"]
    search_fields = ["symptoms", "patient__user__email"]
    ordering_fields = ["date", "time", "status", "created_at"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        doctor: Doctor = self.request.user.doctor_profile
        return Appointment.objects.select_related("patient__user", "doctor__user").filter(doctor=doctor)

    def perform_update(self, serializer):
        if set(serializer.validated_data.keys()) - {"status"}:
            raise exceptions.ValidationError("Only status can be updated by doctors.")
        serializer.save()


class PatientAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "date", "doctor"]
    search_fields = ["symptoms", "doctor__user__email"]
    ordering_fields = ["date", "time", "status", "created_at"]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        patient: Patient = self.request.user.patient_profile
        return Appointment.objects.select_related("patient__user", "doctor__user").filter(patient=patient)

    def perform_create(self, serializer):
        patient = getattr(self.request.user, "patient_profile", None)
        if not patient:
            raise exceptions.PermissionDenied("Patient profile not found.")
        serializer.save(patient=patient, status=Appointment.Status.PENDING)

    def perform_update(self, serializer):
        appointment: Appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            raise exceptions.ValidationError("Only pending appointments can be updated.")
        if "status" in serializer.validated_data:
            raise exceptions.ValidationError("Patients cannot change appointment status.")
        serializer.save(patient=appointment.patient)

    def perform_destroy(self, instance):
        if instance.status != Appointment.Status.PENDING:
            raise exceptions.ValidationError("Only pending appointments can be cancelled.")
        instance.delete()
