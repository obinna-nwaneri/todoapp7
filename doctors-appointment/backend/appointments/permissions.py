from __future__ import annotations

from rest_framework.permissions import BasePermission

from .models import Appointment, Profile


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(request.user and request.user.is_authenticated and profile and profile.role == Profile.Role.ADMIN)


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(request.user and request.user.is_authenticated and profile and profile.role == Profile.Role.DOCTOR)


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        profile = getattr(request.user, "profile", None)
        return bool(request.user and request.user.is_authenticated and profile and profile.role == Profile.Role.PATIENT)


class AppointmentPermission(BasePermission):
    """Object level permission for appointments."""

    def has_object_permission(self, request, view, obj: Appointment):
        profile = getattr(request.user, "profile", None)
        if not request.user or not request.user.is_authenticated or not profile:
            return False

        if profile.role == Profile.Role.ADMIN:
            return True

        if profile.role == Profile.Role.DOCTOR:
            return obj.doctor.user_id == request.user.id

        if profile.role == Profile.Role.PATIENT:
            return obj.patient.user_id == request.user.id

        return False

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
