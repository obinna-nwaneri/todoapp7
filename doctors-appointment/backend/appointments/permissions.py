"""Custom permission classes."""
from __future__ import annotations

from rest_framework.permissions import BasePermission

from .models import Profile


def _get_role(request) -> str | None:
    user = getattr(request, "user", None)
    if not getattr(user, "is_authenticated", False):
        return None
    profile = getattr(user, "profile", None)
    if profile:
        return profile.role
    if getattr(user, "is_superuser", False):
        return Profile.Role.ADMIN
    return None


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return _get_role(request) == Profile.Role.ADMIN


class IsDoctor(BasePermission):
    def has_permission(self, request, view) -> bool:
        return _get_role(request) == Profile.Role.DOCTOR


class IsPatient(BasePermission):
    def has_permission(self, request, view) -> bool:
        return _get_role(request) == Profile.Role.PATIENT
