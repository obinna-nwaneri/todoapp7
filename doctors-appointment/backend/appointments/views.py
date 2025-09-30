from __future__ import annotations

from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty, doctor_day_slots
from .permissions import AppointmentPermission, IsAdmin, IsDoctor
from .serializers import (
    AppointmentSerializer,
    AvailabilitySerializer,
    DoctorSerializer,
    ProfileSerializer,
    SpecialtySerializer,
    UserSerializer,
)


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    search_fields = ["name"]
    permission_classes = [AllowAny]


class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.select_related("user", "specialty").all()
    serializer_class = DoctorSerializer
    filterset_fields = ["specialty", "is_active"]
    search_fields = ["user__first_name", "user__last_name", "clinic_name", "specialty__name"]
    ordering_fields = ["clinic_name", "user__last_name"]
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"], url_path="slots")
    def slots(self, request, pk=None):
        doctor = self.get_object()
        date_str = request.query_params.get("date")
        if not date_str:
            raise ValidationError({"date": "This query parameter is required"})
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise ValidationError({"date": "Invalid date format"}) from exc

        today = timezone.localdate()
        if target_date < today:
            raise ValidationError({"date": "Cannot request slots in the past"})
        if target_date > today + timedelta(days=30):
            raise ValidationError({"date": "Cannot request slots more than 30 days ahead"})

        slots = doctor_day_slots(doctor, target_date)
        appointments = doctor.appointments.filter(
            date=target_date,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
                Appointment.Status.COMPLETED,
            ],
        )
        unavailable = {(appt.start_time, appt.end_time) for appt in appointments}
        available_slots = [
            {"start_time": start.strftime("%H:%M"), "end_time": end.strftime("%H:%M")}
            for start, end in slots
            if (start, end) not in unavailable
        ]
        return Response(available_slots)


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsDoctor]

    def get_queryset(self):
        return Availability.objects.filter(doctor__user=self.request.user).order_by("weekday", "start_time")

    def perform_create(self, serializer):
        doctor = getattr(self.request.user, "doctor_profile", None)
        if not doctor:
            raise PermissionDenied("Only doctors can manage availability")
        serializer.save(doctor=doctor)

    def perform_update(self, serializer):
        doctor = getattr(self.request.user, "doctor_profile", None)
        if not doctor:
            raise PermissionDenied("Only doctors can manage availability")
        if serializer.instance.doctor != doctor:
            raise PermissionDenied("Cannot modify another doctor's availability")
        serializer.save()

    def perform_destroy(self, instance):
        doctor = getattr(self.request.user, "doctor_profile", None)
        if not doctor or instance.doctor != doctor:
            raise PermissionDenied("Cannot modify another doctor's availability")
        instance.delete()


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [AppointmentPermission]
    filterset_fields = ["status", "doctor", "patient"]
    ordering_fields = ["date", "start_time"]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, "profile", None)
        queryset = Appointment.objects.select_related("doctor__user", "patient__user").all()
        if not user.is_authenticated or not profile:
            return Appointment.objects.none()

        if profile.role == Profile.Role.ADMIN:
            return queryset
        if profile.role == Profile.Role.DOCTOR:
            return queryset.filter(doctor__user=user)
        if profile.role == Profile.Role.PATIENT:
            return queryset.filter(patient__user=user)
        return Appointment.objects.none()

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        date_after = self.request.query_params.get("date_after")
        date_before = self.request.query_params.get("date_before")
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, "profile", None)
        if profile and profile.role == Profile.Role.DOCTOR:
            raise PermissionDenied("Doctors cannot create appointments for patients")
        serializer.save()

    def perform_update(self, serializer):
        instance = serializer.instance
        new_status = self.request.data.get("status")
        if new_status:
            self._validate_status_transition(instance, new_status)
        serializer.save()

    def _validate_status_transition(self, appointment: Appointment, new_status: str) -> None:
        current_status = appointment.status
        profile = getattr(self.request.user, "profile", None)
        if not profile:
            raise PermissionDenied("Invalid user")

        allowed = False
        if profile.role == Profile.Role.ADMIN:
            allowed = True
        elif profile.role == Profile.Role.DOCTOR and appointment.doctor.user_id == self.request.user.id:
            allowed = True
        elif profile.role == Profile.Role.PATIENT and appointment.patient.user_id == self.request.user.id:
            allowed = new_status == Appointment.Status.CANCELLED and current_status in (
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
            )
        else:
            allowed = False

        if not allowed:
            raise PermissionDenied("Not allowed to change status")

        valid_transitions = {
            Appointment.Status.PENDING: {Appointment.Status.CONFIRMED, Appointment.Status.CANCELLED},
            Appointment.Status.CONFIRMED: {Appointment.Status.COMPLETED, Appointment.Status.CANCELLED},
            Appointment.Status.CANCELLED: set(),
            Appointment.Status.COMPLETED: set(),
        }
        if new_status not in valid_transitions[current_status]:
            raise ValidationError({"status": "Invalid status transition"})

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        profile = getattr(request.user, "profile", None)
        if profile and profile.role == Profile.Role.PATIENT and appointment.patient.user_id == request.user.id:
            if appointment.status in (Appointment.Status.PENDING, Appointment.Status.CONFIRMED):
                appointment.status = Appointment.Status.CANCELLED
                appointment.save(update_fields=["status"])
                return Response(status=status.HTTP_204_NO_CONTENT)
            raise PermissionDenied("Cannot cancel this appointment")
        if profile and profile.role != Profile.Role.ADMIN:
            raise PermissionDenied("Only admins can delete appointments")
        return super().destroy(request, *args, **kwargs)


class PatientRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        with transaction.atomic():
            username = request.data.get("username")
            password = request.data.get("password")
            phone = request.data.get("phone")
            if not username or not password or not phone:
                return Response({"detail": "username, password and phone are required"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=username).exists():
                return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

            dob_value = request.data.get("dob")
            if dob_value:
                try:
                    dob = datetime.strptime(dob_value, "%Y-%m-%d").date()
                except ValueError as exc:
                    return Response({"detail": "Invalid dob format"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                dob = timezone.localdate()

            user = User.objects.create_user(
                username=username,
                password=password,
                email=request.data.get("email", ""),
                first_name=request.data.get("first_name", ""),
                last_name=request.data.get("last_name", ""),
            )
            Profile.objects.create(user=user, role=Profile.Role.PATIENT, phone=phone)
            Patient.objects.create(user=user, dob=dob, address=request.data.get("address", ""))
        return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)


class AdminRegistrationView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"detail": "username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                password=password,
                email=request.data.get("email", ""),
                first_name=request.data.get("first_name", ""),
                last_name=request.data.get("last_name", ""),
            )
            Profile.objects.create(user=user, role=Profile.Role.ADMIN, phone=request.data.get("phone", ""))
        return Response({"message": "Admin created"}, status=status.HTTP_201_CREATED)


class MeView(APIView):
    def get(self, request):
        user_serializer = UserSerializer(request.user)
        profile = getattr(request.user, "profile", None)
        profile_serializer = ProfileSerializer(profile) if profile else None
        data = {"user": user_serializer.data, "profile": profile_serializer.data if profile_serializer else None}
        return Response(data)
