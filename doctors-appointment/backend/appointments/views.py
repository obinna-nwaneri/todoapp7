from __future__ import annotations

from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import transaction
from django_filters import rest_framework as filters
from rest_framework import permissions, serializers, status, viewsets
from rest_framework import filters as drf_filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty, generate_slots
from .permissions import IsDoctor, can_manage_appointment
from .serializers import (
    AppointmentSerializer,
    AvailabilitySerializer,
    DoctorSerializer,
    ProfileSerializer,
    SpecialtySerializer,
    UserSerializer,
)

UserModel = get_user_model()


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet[Specialty]):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [drf_filters.SearchFilter]
    search_fields = ["name"]


class DoctorViewSet(viewsets.ReadOnlyModelViewSet[Doctor]):
    queryset = Doctor.objects.select_related("user", "specialty")
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_fields = ["specialty", "is_active"]
    search_fields = ["user__first_name", "user__last_name", "clinic_name", "specialty__name"]
    ordering_fields = ["clinic_name", "user__last_name"]

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def slots(self, request: Request, pk: str | None = None) -> Response:
        doctor = self.get_object()
        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"detail": "date query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        slots = generate_slots(doctor, target_date)
        return Response(
            [
                {
                    "start_time": slot["start_time"].strftime("%H:%M"),
                    "end_time": slot["end_time"].strftime("%H:%M"),
                }
                for slot in slots
            ]
        )


class AvailabilityViewSet(viewsets.ModelViewSet[Availability]):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "doctor"):
            return Availability.objects.filter(doctor=user.doctor)
        return Availability.objects.none()

    def perform_create(self, serializer: AvailabilitySerializer) -> None:
        serializer.save(doctor=self.request.user.doctor)

    def perform_update(self, serializer: AvailabilitySerializer) -> None:
        serializer.save(doctor=self.request.user.doctor)


class AppointmentFilter(filters.FilterSet):
    date_after = filters.DateFilter(field_name="date", lookup_expr="gte")
    date_before = filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Appointment
        fields = ["status", "doctor", "date_after", "date_before"]


class AppointmentViewSet(viewsets.ModelViewSet[Appointment]):
    serializer_class = AppointmentSerializer
    filterset_class = AppointmentFilter
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend, drf_filters.OrderingFilter]
    ordering_fields = ["date", "start_time", "status"]
    ordering = ["date", "start_time"]

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.select_related("doctor__user", "patient__user", "doctor__specialty")
        if not hasattr(user, "profile"):
            return queryset.none()
        role = user.profile.role
        if role == Profile.Role.ADMIN:
            return queryset
        if role == Profile.Role.DOCTOR and hasattr(user, "doctor"):
            return queryset.filter(doctor=user.doctor)
        if role == Profile.Role.PATIENT and hasattr(user, "patient"):
            return queryset.filter(patient=user.patient)
        return queryset.none()

    def perform_create(self, serializer: AppointmentSerializer) -> None:
        serializer.save()

    def update(self, request: Request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        if not can_manage_appointment(request.user, instance):
            return Response(status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get("status")
        if new_status:
            self._validate_status_transition(instance, new_status)
            instance.status = new_status
            instance.save(update_fields=["status", "updated_at"])
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        if not can_manage_appointment(request.user, instance):
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request: Request, pk: str | None = None) -> Response:
        appointment = self.get_object()
        if not can_manage_appointment(request.user, appointment):
            return Response(status=status.HTTP_403_FORBIDDEN)
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(appointment).data)

    def _validate_status_transition(self, appointment: Appointment, new_status: str) -> None:
        valid_transitions = {
            Appointment.Status.PENDING: {Appointment.Status.CONFIRMED, Appointment.Status.CANCELLED},
            Appointment.Status.CONFIRMED: {Appointment.Status.COMPLETED, Appointment.Status.CANCELLED},
            Appointment.Status.CANCELLED: set(),
            Appointment.Status.COMPLETED: set(),
        }
        if new_status not in dict(Appointment.Status.choices):
            raise serializers.ValidationError({"status": "Invalid status."})
        allowed = valid_transitions.get(appointment.status, set())
        if new_status not in allowed:
            raise serializers.ValidationError({"status": "Invalid status transition."})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request: Request) -> Response:
    data = request.data
    username = data.get("username")
    password = data.get("password")
    email = data.get("email", "")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    phone = data.get("phone")
    dob = data.get("dob")

    if not all([username, password, dob, phone]):
        return Response({"detail": "username, password, dob and phone are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        dob_value = datetime.strptime(dob, "%Y-%m-%d").date()
    except ValueError:
        return Response({"detail": "Invalid dob format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    if UserModel.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user = UserModel.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        profile = Profile.objects.create(user=user, role=Profile.Role.PATIENT, phone=phone)
        Patient.objects.create(user=user, dob=dob_value)

    serializer = UserSerializer(user)
    return Response({"user": serializer.data, "profile": {"role": profile.role}}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def current_user_view(request: Request) -> Response:
    user = request.user
    data = {
        "user": UserSerializer(user).data,
        "profile": ProfileSerializer(user.profile).data if hasattr(user, "profile") else None,
    }
    return Response(data)
