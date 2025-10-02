from rest_framework.permissions import BasePermission

from .models import User


class IsRolePermission(BasePermission):
    role: User.Role | None = None

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and self.role is not None
            and request.user.role == self.role
        )


class IsAdminRole(IsRolePermission):
    role = User.Role.ADMIN


class IsDoctorRole(IsRolePermission):
    role = User.Role.DOCTOR


class IsPatientRole(IsRolePermission):
    role = User.Role.PATIENT
