from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Doctor, Patient, Appointment
from .serializers import (
    DoctorSerializer,
    PatientSerializer,
    AppointmentSerializer,
    AppointmentStatusSerializer,
    DoctorRegistrationSerializer,
    PatientRegistrationSerializer,
)
from .permissions import (
    IsAdmin,
    IsDoctor,
    IsPatient,
    IsAdminOrDoctor,
    IsAdminOrPatient,
    IsStaffRoles,
)

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        }
        data["redirect_to"] = settings.ROLE_REDIRECTS.get(user.role)
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("user").all()
    serializer_class = DoctorSerializer
    filterset_fields = ["specialization", "years_of_experience"]
    search_fields = ["name", "specialization", "user__email"]

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            permission_classes = [IsAdmin]
        elif self.action in ["update", "partial_update"]:
            permission_classes = [IsAdminOrDoctor]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if not user.is_authenticated:
            return qs
        if user.role == User.Roles.DOCTOR:
            return qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related("user").all()
    serializer_class = PatientSerializer
    filterset_fields = ["gender", "age"]
    search_fields = ["name", "contact_info", "user__email"]

    def get_permissions(self):
        if self.action in ["destroy"]:
            permission_classes = [IsAdmin]
        elif self.action in ["create"]:
            permission_classes = [IsAdminOrPatient]
        elif self.action in ["update", "partial_update"]:
            permission_classes = [IsAdminOrPatient]
        else:
            permission_classes = [IsStaffRoles]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if not user.is_authenticated:
            return qs.none()
        if user.role == User.Roles.PATIENT:
            return qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor", "patient__user", "doctor__user")
    serializer_class = AppointmentSerializer
    filterset_fields = ["status", "date", "doctor__id", "patient__id"]
    search_fields = ["patient__name", "doctor__name", "symptoms"]

    def get_permissions(self):
        if self.action == "destroy":
            permission_classes = [IsAdminOrPatient]
        elif self.action in ["create", "update", "partial_update"]:
            permission_classes = [IsStaffRoles]
        elif self.action == "status":
            permission_classes = [IsAdminOrDoctor]
        else:
            permission_classes = [IsStaffRoles]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == User.Roles.DOCTOR:
            return qs.filter(doctor__user=user)
        if user.role == User.Roles.PATIENT:
            return qs.filter(patient__user=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        data = {}
        if user.role == User.Roles.PATIENT and hasattr(user, "patient_profile"):
            data["patient"] = user.patient_profile
        if user.role == User.Roles.DOCTOR and hasattr(user, "doctor_profile"):
            data["doctor"] = user.doctor_profile
        serializer.save(**data)

    @action(detail=True, methods=["post"], url_path="status")
    def status(self, request, pk=None):
        appointment = self.get_object()
        serializer = AppointmentStatusSerializer(data=request.data, instance=appointment, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AppointmentSerializer(appointment, context=self.get_serializer_context()).data)


class DoctorRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DoctorRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save()
        return Response(DoctorSerializer(doctor).data, status=status.HTTP_201_CREATED)


class PatientRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PatientRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        return Response(PatientSerializer(patient).data, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "redirect_to": settings.ROLE_REDIRECTS.get(user.role),
        }
        if user.role == User.Roles.DOCTOR and hasattr(user, "doctor_profile"):
            data["profile_id"] = user.doctor_profile.id
        if user.role == User.Roles.PATIENT and hasattr(user, "patient_profile"):
            data["profile_id"] = user.patient_profile.id
        return Response(data)


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        data = {
            "doctors": Doctor.objects.count(),
            "patients": Patient.objects.count(),
            "appointments": Appointment.objects.count(),
            "appointment_status": Appointment.objects.values("status").annotate(total=Count("id")),
        }
        return Response(data)


class DoctorDashboardView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        doctor = request.user.doctor_profile
        upcoming = Appointment.objects.filter(doctor=doctor).order_by("date", "time")[:10]
        return Response({
            "doctor": DoctorSerializer(doctor).data,
            "upcoming": AppointmentSerializer(upcoming, many=True).data,
        })


class PatientDashboardView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        patient = request.user.patient_profile
        upcoming = Appointment.objects.filter(patient=patient, status__in=[
            Appointment.Status.PENDING,
            Appointment.Status.APPROVED,
        ]).order_by("date", "time")[:10]
        past = Appointment.objects.filter(patient=patient, status=Appointment.Status.COMPLETED).order_by("-date", "-time")[:10]
        return Response({
            "patient": PatientSerializer(patient).data,
            "upcoming": AppointmentSerializer(upcoming, many=True).data,
            "past": AppointmentSerializer(past, many=True).data,
        })
