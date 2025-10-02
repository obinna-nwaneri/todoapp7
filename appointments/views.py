from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin

from .models import Appointment, Doctor, Patient
from .serializers import AppointmentSerializer, DoctorSerializer, PatientSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("user")
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["name", "specialization", "user__email"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [IsAuthenticated()]
        if self.request.user.role == "ADMIN":
            return [IsAdmin()]
        raise PermissionDenied("Only administrators can modify doctor records.")

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset
        if user.role == "DOCTOR":
            return self.queryset.filter(user=user)
        return self.queryset

    def perform_create(self, serializer):
        doctor = serializer.save()
        if doctor.user.role != "DOCTOR":
            doctor.user.role = "DOCTOR"
            doctor.user.save()


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related("user")
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["name", "user__email"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [IsAuthenticated()]
        if self.request.user.role == "ADMIN":
            return [IsAdmin()]
        raise PermissionDenied("Only administrators can modify patient records.")

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return self.queryset
        if user.role == "PATIENT":
            return self.queryset.filter(user=user)
        return self.queryset

    def perform_create(self, serializer):
        patient = serializer.save()
        if patient.user.role != "PATIENT":
            patient.user.role = "PATIENT"
            patient.user.save()


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "patient", "doctor__user", "patient__user")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "date", "doctor", "patient"]
    search_fields = ["doctor__name", "patient__name", "symptoms", "doctor__specialization"]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.role == "ADMIN":
            return qs
        if user.role == "DOCTOR":
            return qs.filter(doctor__user=user)
        if user.role == "PATIENT":
            return qs.filter(patient__user=user)
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "PATIENT":
            patient = Patient.objects.get(user=user)
            serializer.save(patient=patient)
        elif user.role == "DOCTOR":
            doctor = Doctor.objects.get(user=user)
            serializer.save(doctor=doctor)
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance
        if user.role == "DOCTOR" and instance.doctor.user != user:
            raise PermissionDenied("Cannot modify other doctor's appointments")
        if user.role == "PATIENT" and instance.patient.user != user:
            raise PermissionDenied("Cannot modify other patient's appointments")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role == "ADMIN":
            instance.delete()
            return
        if user.role == "DOCTOR" and instance.doctor.user == user:
            instance.delete()
            return
        if user.role == "PATIENT" and instance.patient.user == user:
            instance.delete()
            return
        raise PermissionDenied("Cannot delete this appointment")
