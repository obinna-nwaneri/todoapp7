from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from appointments.models import Appointment
from doctors.models import Doctor
from patients.models import Patient
from accounts.permissions import IsAdminRole
from .serializers import (
    DoctorRegistrationSerializer,
    PatientRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class DoctorRegistrationView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class PatientRegistrationView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RefreshTokenView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer


class AdminStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        data = {
            'doctors': Doctor.objects.count(),
            'patients': Patient.objects.count(),
            'appointments': Appointment.objects.count(),
            'pending_appointments': Appointment.objects.filter(status=Appointment.Status.PENDING).count(),
        }
        return Response(data)
