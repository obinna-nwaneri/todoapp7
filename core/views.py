from __future__ import annotations

import csv
from io import StringIO

from django.db import models
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsDoctor, IsPatient
from appointments.models import Appointment
from core.utils import record_audit_log
from doctors.models import Doctor
from patients.models import Patient


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        data = {
            "doctors": Doctor.objects.count(),
            "patients": Patient.objects.count(),
            "appointments": Appointment.objects.count(),
            "pending": Appointment.objects.filter(status=Appointment.Status.PENDING).count(),
            "today": Appointment.objects.filter(start_at__date=today).count(),
        }
        return Response(data)


class AdminReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        per_doctor = (
            Appointment.objects.values("doctor__name")
            .order_by("doctor__name")
            .annotate(count=models.Count("id"))
        )
        per_specialization = (
            Appointment.objects.values("doctor__specialization")
            .order_by("doctor__specialization")
            .annotate(count=models.Count("id"))
        )
        return Response({
            "per_doctor": list(per_doctor),
            "per_specialization": list(per_specialization),
        })


class AdminAppointmentExportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        status_param = request.query_params.get("status")
        doctor = request.query_params.get("doctor")

        qs = Appointment.objects.select_related("doctor", "patient")
        if start:
            qs = qs.filter(start_at__date__gte=start)
        if end:
            qs = qs.filter(start_at__date__lte=end)
        if status_param:
            qs = qs.filter(status=status_param)
        if doctor:
            qs = qs.filter(doctor_id=doctor)

        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["Doctor", "Patient", "Start", "Status", "Symptoms"])
        for appointment in qs:
            writer.writerow([
                appointment.doctor.name,
                appointment.patient.name,
                appointment.start_at.isoformat(),
                appointment.status,
                appointment.symptoms,
            ])
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=appointments.csv"
        record_audit_log(actor=request.user, action="export_appointments", entity="Appointment", entity_id="export", diff={}, request=request)
        return response


class DoctorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request):
        doctor = request.user.doctor_profile
        now = timezone.now()
        upcoming = Appointment.objects.filter(doctor=doctor, start_at__gte=now).order_by("start_at")[:5]
        pending = Appointment.objects.filter(doctor=doctor, status=Appointment.Status.PENDING).order_by("start_at")
        today = Appointment.objects.filter(doctor=doctor, start_at__date=now.date()).order_by("start_at")
        return Response(
            {
                "upcoming": [
                    {"id": a.id, "patient": a.patient.name, "start_at": a.start_at, "status": a.status}
                    for a in upcoming
                ],
                "pending": [
                    {"id": a.id, "patient": a.patient.name, "start_at": a.start_at, "status": a.status}
                    for a in pending
                ],
                "today": [
                    {"id": a.id, "patient": a.patient.name, "start_at": a.start_at, "status": a.status}
                    for a in today
                ],
            }
        )


class PatientDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPatient]

    def get(self, request):
        patient = request.user.patient_profile
        now = timezone.now()
        upcoming = Appointment.objects.filter(patient=patient, start_at__gte=now).order_by("start_at")[:5]
        past = Appointment.objects.filter(patient=patient, start_at__lt=now).order_by("-start_at")[:5]
        return Response(
            {
                "upcoming": [
                    {"id": a.id, "doctor": a.doctor.name, "start_at": a.start_at, "status": a.status}
                    for a in upcoming
                ],
                "past": [
                    {"id": a.id, "doctor": a.doctor.name, "start_at": a.start_at, "status": a.status}
                    for a in past
                ],
            }
        )
