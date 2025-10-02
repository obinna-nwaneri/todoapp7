from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsAdmin(RolePermission):
    allowed_roles = ["ADMIN"]


class IsDoctor(RolePermission):
    allowed_roles = ["DOCTOR"]


class IsPatient(RolePermission):
    allowed_roles = ["PATIENT"]


class IsAdminOrDoctor(RolePermission):
    allowed_roles = ["ADMIN", "DOCTOR"]


class IsAdminOrPatient(RolePermission):
    allowed_roles = ["ADMIN", "PATIENT"]


class IsStaffRoles(RolePermission):
    allowed_roles = ["ADMIN", "DOCTOR", "PATIENT"]
