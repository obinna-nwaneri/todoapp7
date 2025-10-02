from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

from .models import Appointment, Doctor
from .serializers import (
    AdminAppointmentSerializer,
    AppointmentSerializer,
    ChangePasswordSerializer,
    DoctorSerializer,
    ProfileSerializer,
    UserSerializer,
)


UserModel = get_user_model()


class RegistrationView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        if email is None or password is None:
            raise self.fail("no_active_account")

        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password.")

        attrs["username"] = user.username or email
        attrs["password"] = password
        data = super().validate(attrs)
        data.update({
            "user": {
                "id": self.user.id,
                "email": self.user.email,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name,
                "is_staff": self.user.is_staff,
            }
        })
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("name")
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class PatientAppointmentsView(APIView):
    def get(self, request):
        now = timezone.localdate()
        upcoming_qs = (
            Appointment.objects.filter(patient=request.user, date__gte=now)
            .order_by("date", "time")
        )
        past_qs = (
            Appointment.objects.filter(patient=request.user, date__lt=now)
            .order_by("-date", "-time")
        )
        upcoming = AppointmentSerializer(upcoming_qs, many=True, context={"request": request}).data
        past = AppointmentSerializer(past_qs, many=True, context={"request": request}).data
        return Response({"upcoming": upcoming, "past": past})

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(AppointmentSerializer(appointment, context={"request": request}).data, status=status.HTTP_201_CREATED)


class AdminAppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "patient").all()
    serializer_class = AdminAppointmentSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["get", "patch", "put", "delete"]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        status_value = request.data.get("status")
        if status_value not in Appointment.Status.values:
            return Response({"status": "Invalid status supplied."}, status=status.HTTP_400_BAD_REQUEST)
        instance.status = status_value
        instance.save(update_fields=["status", "updated_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class PatientListView(generics.ListAPIView):
    queryset = UserModel.objects.filter(is_staff=False).order_by("first_name", "last_name")
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAdminUser]
