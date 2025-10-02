from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from appointments.models import Doctor, Patient

from .permissions import IsAdmin
from .serializers import RegistrationSerializer, UserSerializer

User = get_user_model()


class DoctorRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data={**request.data, "role": User.Roles.DOCTOR})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Doctor.objects.create(
            user=user,
            name=request.data.get("name", request.data.get("first_name", "")),
            specialization=request.data.get("specialization", "General"),
            years_of_experience=request.data.get("years_of_experience", 0),
            availability_schedule=request.data.get("availability_schedule", ""),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class PatientRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data={**request.data, "role": User.Roles.PATIENT})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        Patient.objects.create(
            user=user,
            name=request.data.get("name", request.data.get("first_name", "")),
            age=request.data.get("age", 0),
            gender=request.data.get("gender", ""),
            contact_info=request.data.get("contact_info", ""),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    search_fields = ["email", "first_name", "last_name", "role"]

    def get_permissions(self):
        if getattr(self, "action", None) == "me":
            return [IsAuthenticated()]
        return [permission() for permission in self.permission_classes]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        data = serializer.data
        data["redirect_url"] = settings.LOGIN_REDIRECTS.get(request.user.role, "/")
        return Response(data)

    def update(self, request, *args, **kwargs):
        if "role" in request.data:
            user = self.get_object()
            user.role = request.data["role"]
            user.save()
            return Response(self.get_serializer(user).data)
        return super().update(request, *args, **kwargs)


class RoleRedirectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"redirect_url": settings.LOGIN_REDIRECTS.get(request.user.role, "/")})
