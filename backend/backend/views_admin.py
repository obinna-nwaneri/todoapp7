from __future__ import annotations

from rest_framework import permissions, response, views

from accounts.permissions import IsAdminRole
from appointments.models import Appointment
from doctors.models import Doctor
from patients.models import Patient


class AdminStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        data = {
            "total_doctors": Doctor.objects.count(),
            "total_patients": Patient.objects.count(),
            "total_appointments": Appointment.objects.count(),
            "pending_appointments": Appointment.objects.filter(status=Appointment.Status.PENDING).count(),
        }
        return response.Response(data)
