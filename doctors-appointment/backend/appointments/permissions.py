from __future__ import annotations

from rest_framework.permissions import BasePermission

from .models import Appointment, Profile


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, "profile") and request.user.profile.role == Profile.Role.ADMIN)


class IsDoctor(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, "profile") and request.user.profile.role == Profile.Role.DOCTOR)


class IsPatient(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, "profile") and request.user.profile.role == Profile.Role.PATIENT)


def can_manage_appointment(user, appointment: Appointment) -> bool:
    if not user or not user.is_authenticated or not hasattr(user, "profile"):
        return False
    role = user.profile.role
    if role == Profile.Role.ADMIN:
        return True
    if role == Profile.Role.DOCTOR and hasattr(user, "doctor"):
        return appointment.doctor_id == getattr(user.doctor, "id", None)
    if role == Profile.Role.PATIENT and hasattr(user, "patient"):
        return appointment.patient_id == getattr(user.patient, "id", None)
    return False
