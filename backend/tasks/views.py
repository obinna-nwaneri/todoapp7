from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Task
from .serializers import TaskSerializer, UserSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["is_staff"] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "is_staff": self.user.is_staff,
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Task.objects.all()
        return Task.objects.filter(user=user)

    def perform_create(self, serializer):
        assigned_user = (
            serializer.validated_data.get("user")
            if self.request.user.is_staff and "user" in serializer.validated_data
            else self.request.user
        )
        serializer.save(user=assigned_user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Task.objects.all()
        return Task.objects.filter(user=user)

    def perform_update(self, serializer):
        assigned_user = (
            serializer.validated_data.get("user")
            if self.request.user.is_staff and "user" in serializer.validated_data
            else self.get_object().user
        )
        serializer.save(user=assigned_user)


class DashboardView(APIView):
    def get(self, request):
        user = request.user
        queryset = Task.objects.all() if user.is_staff else Task.objects.filter(user=user)
        total_tasks = queryset.count()
        status_counts = queryset.values("status").annotate(count=Count("status"))
        data = {
            "total_tasks": total_tasks,
            "by_status": {item["status"]: item["count"] for item in status_counts},
        }
        return Response(data)


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = get_user_model().objects.all().order_by("username")


class AdminSummaryView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        User = get_user_model()
        total_users = User.objects.count()
        total_tasks = Task.objects.count()
        by_status = Task.objects.values("status").annotate(count=Count("status"))
        return Response(
            {
                "total_users": total_users,
                "total_tasks": total_tasks,
                "tasks_by_status": {item["status"]: item["count"] for item in by_status},
            }
        )
