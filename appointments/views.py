from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsDoctor, IsPatient
from appointments.filters import AppointmentFilter
from appointments.models import Appointment
from appointments.serializers import (
    AppointmentCreateSerializer,
    AppointmentSerializer,
    AppointmentStatusSerializer,
    AppointmentUpdateSerializer,
)
from core.utils import record_audit_log, send_notification


def can_transition(current: str, new: str) -> bool:
    transitions = {
        Appointment.Status.PENDING: {Appointment.Status.APPROVED, Appointment.Status.REJECTED, Appointment.Status.CANCELLED},
        Appointment.Status.APPROVED: {Appointment.Status.COMPLETED, Appointment.Status.CANCELLED},
        Appointment.Status.REJECTED: set(),
        Appointment.Status.CANCELLED: set(),
        Appointment.Status.COMPLETED: set(),
    }
    return new in transitions.get(current, set())


class AdminAppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient__user", "doctor__user")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated & IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AppointmentFilter
    search_fields = ["patient__name", "doctor__name", "symptoms", "patient__user__email", "doctor__user__email"]
    ordering_fields = ["start_at", "status", "created_at"]

    @action(detail=True, methods=["post"], url_path="status")
    def set_status(self, request, pk=None):
        appointment = self.get_object()
        serializer = AppointmentStatusSerializer(appointment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data.get("status")
        if not can_transition(appointment.status, new_status):
            return Response({"detail": "Invalid status transition."}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        record_audit_log(actor=request.user, action="appointment_status", entity="Appointment", entity_id=appointment.id, diff={"status": new_status}, request=request)
        return Response(AppointmentSerializer(appointment).data)


class DoctorAppointmentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Appointment.objects.select_related("patient__user", "doctor__user")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated & IsDoctor]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AppointmentFilter
    search_fields = ["patient__name", "patient__user__email", "symptoms"]
    ordering_fields = ["start_at", "status", "created_at"]

    def get_queryset(self):
        return super().get_queryset().filter(doctor__user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        appointment = self.get_object()
        serializer = AppointmentStatusSerializer(appointment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data.get("status")
        if not can_transition(appointment.status, new_status):
            return Response({"detail": "Invalid status transition."}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        record_audit_log(actor=request.user, action="doctor_status", entity="Appointment", entity_id=appointment.id, diff={"status": new_status}, request=request)
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=["get"], url_path="upcoming")
    def upcoming(self, request):
        qs = self.get_queryset().filter(start_at__gte=timezone.now()).order_by("start_at")[:10]
        serializer = AppointmentSerializer(qs, many=True)
        return Response(serializer.data)


class PatientAppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient__user", "doctor__user")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated & IsPatient]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AppointmentFilter
    search_fields = ["doctor__name", "doctor__user__email", "symptoms"]
    ordering_fields = ["start_at", "status", "created_at"]

    def get_queryset(self):
        return super().get_queryset().filter(patient__user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        if self.action in {"update", "partial_update"}:
            return AppointmentUpdateSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        appointment = serializer.save()
        record_audit_log(actor=self.request.user, action="book_appointment", entity="Appointment", entity_id=appointment.id, diff={"status": appointment.status}, request=self.request)

    def perform_update(self, serializer):
        appointment = serializer.save()
        record_audit_log(actor=self.request.user, action="update_appointment", entity="Appointment", entity_id=appointment.id, diff={"status": appointment.status}, request=self.request)

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            return Response({"detail": "Only pending appointments can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        cancellation_window = getattr(settings, "CANCELLATION_WINDOW_HOURS", 4)
        if appointment.start_at - timezone.now() < timedelta(hours=cancellation_window):
            return Response({"detail": "Too late to cancel."}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = Appointment.Status.CANCELLED
        appointment.save(update_fields=["status", "updated_at"])
        send_notification(
            [appointment.patient.user.email],
            "Appointment cancelled",
            f"Your appointment with {appointment.doctor.name} on {appointment.start_at} was cancelled.",
        )
        send_notification(
            [appointment.doctor.user.email],
            "Appointment cancelled",
            f"Patient {appointment.patient.name} cancelled the appointment on {appointment.start_at}.",
        )
        record_audit_log(actor=request.user, action="cancel_appointment", entity="Appointment", entity_id=appointment.id, diff={"status": appointment.status}, request=request)
        return Response(status=status.HTTP_204_NO_CONTENT)
