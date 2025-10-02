from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from core.utils import notify_user, record_audit

from .serializers import (
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    RegisterDoctorSerializer,
    RegisterPatientSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterDoctorView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterDoctorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class RegisterPatientView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterPatientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save(base_url=request.data.get("reset_url", ""))
        return Response(data)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated"})


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed"})


class UserAdminViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all().order_by("-date_joined")
    search_fields = ("email",)

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        if role:
            qs = qs.filter(role=role)
        if is_active in {"true", "false"}:
            qs = qs.filter(is_active=is_active == "true")
        return qs

    def perform_create(self, serializer):
        user = serializer.save()
        record_audit("admin_create_user", "User", user.id)

    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        record_audit("user_deactivated", "User", user.id)
        return Response({"detail": "User deactivated"})

    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        record_audit("user_activated", "User", user.id)
        return Response({"detail": "User activated"})

    @action(detail=True, methods=["post"], url_path="send-reset")
    def send_reset(self, request, pk=None):
        user = self.get_object()
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_link = request.data.get("reset_url", "")
        if reset_link:
            reset_link = f"{reset_link}?uid={uid}&token={token}"
        notify_user(user, "Password reset", f"Use this link to reset your password: {reset_link}")
        record_audit("admin_trigger_password_reset", "User", user.id)
        return Response({"detail": "Password reset email sent"})

    @action(detail=True, methods=["post"], url_path="set-role")
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")
        if role not in User.Role.values:
            return Response({"detail": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
        user.save(update_fields=["role"])
        record_audit("user_role_updated", "User", user.id, diff={"role": role})
        return Response(UserSerializer(user).data)
