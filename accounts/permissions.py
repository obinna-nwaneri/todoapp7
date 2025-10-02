from __future__ import annotations

from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    role: str | None = None

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (self.role is None or request.user.role == self.role))


class IsAdmin(RolePermission):
    role = "ADMIN"


class IsDoctor(RolePermission):
    role = "DOCTOR"


class IsPatient(RolePermission):
    role = "PATIENT"
