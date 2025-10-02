from __future__ import annotations

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin, IsDoctor
from core.utils import record_audit_log

from .models import Doctor, TimeBlock
from .serializers import (
    DoctorAdminSerializer,
    DoctorSerializer,
    DoctorWriteSerializer,
    PublicDoctorSerializer,
    TimeBlockSerializer,
)


class DoctorAdminViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("user")
    serializer_class = DoctorAdminSerializer
    permission_classes = [IsAuthenticated & IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["user__is_active"]
    search_fields = ["name", "specialization", "user__email"]
    ordering_fields = ["name", "specialization", "years_experience"]

    def perform_create(self, serializer):
        doctor = serializer.save()
        record_audit_log(actor=self.request.user, action="admin_create_doctor", entity="Doctor", entity_id=doctor.id, diff={}, request=self.request)

    def perform_update(self, serializer):
        doctor = serializer.save()
        record_audit_log(actor=self.request.user, action="admin_update_doctor", entity="Doctor", entity_id=doctor.id, diff={}, request=self.request)

    def perform_destroy(self, instance):
        record_audit_log(actor=self.request.user, action="admin_delete_doctor", entity="Doctor", entity_id=instance.id, diff={}, request=self.request)
        instance.user.delete()


class DoctorProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated & IsDoctor]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return DoctorSerializer
        return DoctorWriteSerializer

    def get_object(self):
        return self.request.user.doctor_profile

    def perform_update(self, serializer):
        doctor = serializer.save()
        record_audit_log(actor=self.request.user, action="doctor_update_profile", entity="Doctor", entity_id=doctor.id, diff={}, request=self.request)


class TimeBlockViewSet(viewsets.ModelViewSet):
    serializer_class = TimeBlockSerializer
    permission_classes = [IsAuthenticated & IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["doctor"]
    ordering_fields = ["start_at", "end_at"]

    def get_queryset(self):
        return TimeBlock.objects.select_related("doctor", "doctor__user")

    def perform_create(self, serializer):
        block = serializer.save()
        record_audit_log(actor=self.request.user, action="create_block", entity="TimeBlock", entity_id=block.id, diff={}, request=self.request)

    def perform_update(self, serializer):
        block = serializer.save()
        record_audit_log(actor=self.request.user, action="update_block", entity="TimeBlock", entity_id=block.id, diff={}, request=self.request)

    def perform_destroy(self, instance):
        record_audit_log(actor=self.request.user, action="delete_block", entity="TimeBlock", entity_id=instance.id, diff={}, request=self.request)
        return super().perform_destroy(instance)


class PublicDoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.select_related("user")
    serializer_class = PublicDoctorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["specialization"]
    search_fields = ["name", "specialization"]
