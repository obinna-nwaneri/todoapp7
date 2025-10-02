from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from core.utils import record_audit_log
from doctors.models import Doctor
from patients.models import Patient

from .serializers import (
    ActivationSerializer,
    DoctorRegistrationSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    PatientRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class DoctorRegisterView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        record_audit_log(actor=request.user, action="register_doctor", entity="Doctor", entity_id=response.data.get("id"), diff={}, request=request)
        return response


class PatientRegisterView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        record_audit_log(actor=request.user, action="register_patient", entity="Patient", entity_id=response.data.get("id"), diff={}, request=request)
        return response


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "If the email exists a reset link was sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated"})


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        record_audit_log(actor=request.user, action="password_change", entity="User", entity_id=request.user.id, diff={}, request=request)
        return Response({"detail": "Password updated"})


class AdminUserActivationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, user_id: int):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ActivationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        record_audit_log(actor=request.user, action="admin_toggle_user", entity="User", entity_id=user.id, diff={"is_active": user.is_active}, request=request)
        return Response(UserSerializer(user).data)
