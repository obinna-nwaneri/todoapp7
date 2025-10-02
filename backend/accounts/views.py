from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    DoctorRegistrationSerializer,
    EmailTokenObtainPairSerializer,
    MeSerializer,
    PatientRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterDoctorView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class RegisterPatientView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RefreshView(TokenRefreshView):
    pass


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile_id = None
        if user.role == User.Role.DOCTOR:
            profile_id = getattr(getattr(user, "doctor_profile", None), "id", None)
        elif user.role == User.Role.PATIENT:
            profile_id = getattr(getattr(user, "patient_profile", None), "id", None)
        data = {
            "user": UserSerializer(user).data,
            "profile_id": profile_id,
        }
        serializer = MeSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return response.Response(serializer.data)
