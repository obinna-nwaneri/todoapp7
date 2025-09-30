"""API views for appointments."""
from __future__ import annotations

from datetime import date

from django.contrib.auth import get_user_model
from django.db import transaction
from django_filters.rest_framework import DateFilter, FilterSet
from rest_framework import decorators, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Appointment, Availability, Doctor, Patient, Profile, Specialty, generate_slots
from .serializers import AppointmentSerializer, AvailabilitySerializer, DoctorSerializer, SpecialtySerializer, UserSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        profile = getattr(user, "profile", None)
        if profile:
            token["role"] = profile.role
        return token

    def validate(self, attrs):  # type: ignore[override]
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        profile = getattr(self.user, "profile", None)
        data["profile"] = {"role": getattr(profile, "role", None)}
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    pass


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet[Specialty]):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name"]


class DoctorViewSet(viewsets.ReadOnlyModelViewSet[Doctor]):
    queryset = Doctor.objects.select_related("user", "specialty")
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = {"specialty": ["exact"], "is_active": ["exact"]}
    search_fields = ["user__first_name", "user__last_name", "clinic_name", "specialty__name"]
    ordering_fields = ["clinic_name", "user__last_name"]

    @decorators.action(detail=True, methods=["get"], url_path="slots")
    def slots(self, request: Request, pk: str | None = None) -> Response:
        doctor = self.get_object()
        date_param = request.query_params.get("date")
        if not date_param:
            return Response({"detail": "Query parameter 'date' is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_date = date.fromisoformat(date_param)
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        slots = generate_slots(doctor, target_date)
        return Response(slots)


class AvailabilityViewSet(viewsets.ModelViewSet[Availability]):
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        qs = Availability.objects.select_related("doctor", "doctor__user")
        if role == Profile.Role.ADMIN:
            return qs
        if role == Profile.Role.DOCTOR:
            return qs.filter(doctor=getattr(user, "doctor_profile", None))
        return qs.none()

    def perform_create(self, serializer: AvailabilitySerializer) -> None:
        user = self.request.user
        doctor = getattr(user, "doctor_profile", None)
        if doctor is None:
            raise PermissionDenied("Only doctors can create availability.")
        serializer.save(doctor=doctor)

    def perform_update(self, serializer: AvailabilitySerializer) -> None:
        instance = self.get_object()
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role != Profile.Role.ADMIN and instance.doctor != getattr(user, "doctor_profile", None):
            raise PermissionDenied("You cannot edit this availability.")
        serializer.save()

    def perform_destroy(self, instance: Availability) -> None:
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == Profile.Role.ADMIN or instance.doctor == getattr(user, "doctor_profile", None):
            instance.delete()
        else:
            raise PermissionDenied("You cannot delete this availability.")


class AppointmentFilter(FilterSet):
    date_after = DateFilter(field_name="date", lookup_expr="gte")
    date_before = DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Appointment
        fields = ["status", "doctor", "date_after", "date_before"]


class AppointmentViewSet(viewsets.ModelViewSet[Appointment]):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = AppointmentFilter

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        qs = Appointment.objects.select_related("doctor", "doctor__user", "patient", "patient__user", "doctor__specialty")
        if role == Profile.Role.ADMIN:
            return qs
        if role == Profile.Role.DOCTOR:
            return qs.filter(doctor=getattr(user, "doctor_profile", None))
        if role == Profile.Role.PATIENT:
            return qs.filter(patient=getattr(user, "patient_profile", None))
        return qs.none()

    def perform_create(self, serializer: AppointmentSerializer) -> None:
        serializer.save()

    def perform_update(self, serializer: AppointmentSerializer) -> None:
        instance = serializer.instance
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == Profile.Role.PATIENT and instance.patient != getattr(user, "patient_profile", None):
            raise PermissionDenied("Cannot modify this appointment.")
        if role == Profile.Role.DOCTOR and instance.doctor != getattr(user, "doctor_profile", None):
            raise PermissionDenied("Cannot modify this appointment.")
        serializer.save()

    def perform_destroy(self, instance: Appointment) -> None:
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if role == Profile.Role.ADMIN:
            instance.delete()
        elif role == Profile.Role.DOCTOR and instance.doctor == getattr(user, "doctor_profile", None):
            instance.status = Appointment.Status.CANCELLED
            instance.save()
        elif role == Profile.Role.PATIENT and instance.patient == getattr(user, "patient_profile", None):
            instance.status = Appointment.Status.CANCELLED
            instance.save()
        else:
            raise PermissionDenied("You cannot cancel this appointment.")


@decorators.api_view(["POST"])
@decorators.permission_classes([AllowAny])
def register(request: Request) -> Response:
    data = request.data
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            password=password,
            email=data.get("email", ""),
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
        )
        profile = Profile.objects.create(user=user, role=Profile.Role.PATIENT)
        patient = Patient.objects.create(user=user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "profile": {"role": profile.role},
        },
        status=status.HTTP_201_CREATED,
    )


@decorators.api_view(["GET"])
@decorators.permission_classes([IsAuthenticated])
def me(request: Request) -> Response:
    user = request.user
    profile = getattr(user, "profile", None)
    return Response(
        {
            "user": UserSerializer(user).data,
            "profile": {"role": getattr(profile, "role", None)},
        }
    )
