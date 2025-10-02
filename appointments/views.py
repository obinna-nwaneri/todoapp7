from __future__ import annotations

import csv
from io import StringIO

from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User
from core.utils import record_audit
from doctors.models import Doctor
from patients.models import Patient

from .filters import AppointmentFilter
from .models import Appointment
from .serializers import (
    AdminAppointmentSerializer,
    AppointmentCancelSerializer,
    AppointmentCreateSerializer,
    AppointmentSerializer,
    AppointmentStatusSerializer,
    AppointmentUpdateSerializer,
)


class AdminAppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "patient", "doctor__user", "patient__user")
    serializer_class = AdminAppointmentSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_class = AppointmentFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "doctor__name",
        "doctor__user__email",
        "patient__name",
        "patient__user__email",
        "symptoms",
    ]
    ordering_fields = ["start_at", "status", "created_at"]

    def perform_update(self, serializer):
        appointment = serializer.save()
        record_audit("admin_update_appointment", "Appointment", appointment.id)

    def perform_destroy(self, instance):
        record_audit("admin_delete_appointment", "Appointment", instance.id)
        return super().perform_destroy(instance)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request, *args, **kwargs):
        total = Appointment.objects.count()
        pending = Appointment.objects.filter(status=Appointment.Status.PENDING).count()
        today = Appointment.objects.filter(start_at__date=timezone.now().date()).count()
        approved = Appointment.objects.filter(status=Appointment.Status.APPROVED).count()
        return Response(
            {
                "total": total,
                "pending": pending,
                "today": today,
                "approved": approved,
            }
        )

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["ID", "Doctor", "Patient", "Start", "Status", "Symptoms"])
        for appointment in qs:
            writer.writerow(
                [
                    appointment.id,
                    appointment.doctor.name,
                    appointment.patient.name,
                    appointment.start_at.isoformat(),
                    appointment.status,
                    appointment.symptoms,
                ]
            )
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=appointments.csv"
        return response


class DoctorAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = AppointmentFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["patient__name", "patient__user__email", "symptoms"]
    ordering_fields = ["start_at", "status"]

    def get_queryset(self):
        user = self.request.user
        if user.role != User.Role.DOCTOR:
            raise permissions.PermissionDenied("Only doctors can view their appointments")
        doctor = user.doctor_profile
        return (
            Appointment.objects.select_related("patient", "patient__user", "doctor")
            .filter(doctor=doctor)
            .order_by("-start_at")
        )

    def get_serializer_class(self):
        if self.action == "partial_update" or self.action == "update":
            return AppointmentStatusSerializer
        return super().get_serializer_class()

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = AppointmentStatusSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AppointmentSerializer(instance).data)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        appointment = self.get_object()
        serializer = AppointmentStatusSerializer(
            appointment,
            data={"status": Appointment.Status.COMPLETED, "notes": request.data.get("notes", "")},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AppointmentSerializer(appointment).data)


class PatientAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = AppointmentFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["doctor__name", "doctor__user__email", "symptoms"]
    ordering_fields = ["start_at", "status"]

    def get_queryset(self):
        user = self.request.user
        if user.role != User.Role.PATIENT:
            raise permissions.PermissionDenied("Only patients can view their appointments")
        patient = user.patient_profile
        return (
            Appointment.objects.select_related("doctor", "doctor__user", "patient")
            .filter(patient=patient)
            .order_by("-start_at")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        if self.action in {"update", "partial_update"}:
            return AppointmentUpdateSerializer
        return super().get_serializer_class()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action == "create":
            context["patient"] = self.request.user.patient_profile
        return context

    def perform_create(self, serializer):
        appointment = serializer.save()
        record_audit("patient_created_appointment", "Appointment", appointment.id)

    def update(self, request, *args, **kwargs):
        kwargs.setdefault("partial", True)
        response = super().update(request, *args, **kwargs)
        return Response(AppointmentSerializer(self.get_object()).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        serializer = AppointmentCancelSerializer(data=request.data, context={"appointment": appointment})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AppointmentSerializer(appointment).data)


class AdminDashboardStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        doctors_count = Doctor.objects.count()
        patients_count = Patient.objects.count()
        appointments_count = Appointment.objects.count()
        pending = Appointment.objects.filter(status=Appointment.Status.PENDING).count()
        today = Appointment.objects.filter(start_at__date=timezone.now().date()).count()
        return Response(
            {
                "doctors": doctors_count,
                "patients": patients_count,
                "appointments": appointments_count,
                "pending": pending,
                "today": today,
            }
        )


class AppointmentReportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        report = (
            Appointment.objects.values("doctor__specialization")
            .annotate(total=Count("id"))
            .order_by("doctor__specialization")
        )
        return Response(list(report))
