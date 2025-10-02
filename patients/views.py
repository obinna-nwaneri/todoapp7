from __future__ import annotations

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin, IsPatient
from core.utils import record_audit_log

from .models import Patient
from .serializers import PatientAdminSerializer, PatientSerializer, PatientWriteSerializer


class PatientAdminViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related("user")
    serializer_class = PatientAdminSerializer
    permission_classes = [IsAuthenticated & IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["user__is_active"]
    search_fields = ["name", "contact_info", "user__email"]
    ordering_fields = ["name", "age", "user__date_joined"]

    def perform_create(self, serializer):
        patient = serializer.save()
        record_audit_log(actor=self.request.user, action="admin_create_patient", entity="Patient", entity_id=patient.id, diff={}, request=self.request)

    def perform_update(self, serializer):
        patient = serializer.save()
        record_audit_log(actor=self.request.user, action="admin_update_patient", entity="Patient", entity_id=patient.id, diff={}, request=self.request)

    def perform_destroy(self, instance):
        record_audit_log(actor=self.request.user, action="admin_delete_patient", entity="Patient", entity_id=instance.id, diff={}, request=self.request)
        instance.user.delete()


class PatientProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated & IsPatient]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return PatientSerializer
        return PatientWriteSerializer

    def get_object(self):
        return self.request.user.patient_profile

    def perform_update(self, serializer):
        patient = serializer.save()
        record_audit_log(actor=self.request.user, action="patient_update_profile", entity="Patient", entity_id=patient.id, diff={}, request=self.request)
