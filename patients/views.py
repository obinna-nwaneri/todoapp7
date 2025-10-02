from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import filters, generics, permissions, viewsets

from core.utils import record_audit

from .models import Patient
from .serializers import PatientAdminSerializer, PatientSerializer

User = get_user_model()


class AdminPatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related("user").all().order_by("name")
    serializer_class = PatientAdminSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "user__email", "contact_info"]

    def get_queryset(self):
        qs = super().get_queryset()
        is_active = self.request.query_params.get("active")
        date_from = self.request.query_params.get("registered_from")
        date_to = self.request.query_params.get("registered_to")
        if is_active in {"true", "false"}:
            qs = qs.filter(user__is_active=is_active == "true")
        if date_from:
            qs = qs.filter(user__date_joined__date__gte=date_from)
        if date_to:
            qs = qs.filter(user__date_joined__date__lte=date_to)
        return qs


class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.role != User.Role.PATIENT:
            raise permissions.PermissionDenied("Only patients can access this resource")
        try:
            return user.patient_profile
        except Patient.DoesNotExist:  # type: ignore[attr-defined]
            raise permissions.PermissionDenied("Patient profile not found")

    def perform_update(self, serializer):
        patient = serializer.save()
        record_audit("patient_update_profile", "Patient", patient.id)
