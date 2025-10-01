from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment, Doctor, Patient
from .serializers import (
    AppointmentSerializer,
    DoctorSerializer,
    PatientSerializer,
    RegisterSerializer,
    UserSerializer,
)


class AllowGetAnyPermission(permissions.BasePermission):
    """Allow unsafe methods only to admin users, but safe methods to anyone."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("name")
    serializer_class = DoctorSerializer
    permission_classes = [AllowGetAnyPermission]


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("name")
    serializer_class = PatientSerializer

    def get_permissions(self):
        if self.action in ["list", "destroy", "update", "partial_update"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "patient").order_by("-date", "-time")
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        doctor_id = self.request.query_params.get("doctor")
        patient_id = self.request.query_params.get("patient")
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        return queryset

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        appointment.status = Appointment.CANCELLED
        appointment.save(update_fields=["status"])
        serializer = self.get_serializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        user = get_user_model().objects.get(username=patient.email)
        return Response(
            {
                "patient": PatientSerializer(patient).data,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(APIView):
    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
