from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.serializers import (
    AdminUserSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)
from tasks.models import Task


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]


class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_tasks = Task.objects.count()
        latest_users = User.objects.order_by("-date_joined")[:5]
        status_counts = {status: 0 for status, _ in Task.STATUS_CHOICES}
        for row in Task.objects.values("status").annotate(count=Count("id")):
            status_counts[row["status"]] = row["count"]

        data = {
            "total_users": total_users,
            "total_tasks": total_tasks,
            "latest_users": UserSerializer(latest_users, many=True).data,
            "status_breakdown": status_counts,
        }
        return Response(data)


class CurrentUserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
