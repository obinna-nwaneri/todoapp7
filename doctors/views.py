from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.utils import record_audit

from .models import Doctor, TimeBlock
from .serializers import (
    DoctorAdminSerializer,
    DoctorSerializer,
    PublicDoctorSerializer,
    TimeBlockSerializer,
)

User = get_user_model()


class AdminDoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("user").all().order_by("name")
    serializer_class = DoctorAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "specialization", "user__email"]

    def get_queryset(self):
        qs = super().get_queryset()
        specialization = self.request.query_params.get("specialization")
        is_active = self.request.query_params.get("active")
        if specialization:
            qs = qs.filter(specialization__icontains=specialization)
        if is_active in {"true", "false"}:
            qs = qs.filter(user__is_active=is_active == "true")
        return qs


class DoctorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.role != User.Role.DOCTOR:
            raise permissions.PermissionDenied("Only doctors can access this resource")
        try:
            return user.doctor_profile
        except Doctor.DoesNotExist:  # type: ignore[attr-defined]
            raise permissions.PermissionDenied("Doctor profile not found")

    def perform_update(self, serializer):
        doctor = serializer.save()
        record_audit("doctor_update_profile", "Doctor", doctor.id)


class TimeBlockViewSet(viewsets.ModelViewSet):
    queryset = TimeBlock.objects.select_related("doctor").all()
    serializer_class = TimeBlockSerializer
    permission_classes = [permissions.IsAdminUser]


class PublicDoctorList(generics.ListAPIView):
    serializer_class = PublicDoctorSerializer
    queryset = Doctor.objects.filter(user__is_active=True)
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "specialization"]

    def get_queryset(self):
        qs = super().get_queryset()
        specialization = self.request.query_params.get("specialization")
        if specialization:
            qs = qs.filter(specialization__icontains=specialization)
        return qs


class DoctorStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        stats = (
            Doctor.objects.values("specialization")
            .annotate(total=Count("id"))
            .order_by("specialization")
        )
        return Response(list(stats))
