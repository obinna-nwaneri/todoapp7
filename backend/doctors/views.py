from __future__ import annotations

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, viewsets

from accounts.permissions import IsAdminRole, IsDoctorRole
from accounts.serializers import DoctorSerializer

from .models import Doctor


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("user")
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "specialization"]
    ordering_fields = ["name", "specialization", "years_of_experience"]
    filterset_fields = ["specialization"]


class DoctorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorRole]

    def get_object(self):
        return self.request.user.doctor_profile

    def get_queryset(self):
        return Doctor.objects.filter(user=self.request.user)


class DoctorPublicListView(generics.ListAPIView):
    queryset = Doctor.objects.select_related("user")
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "specialization"]
    ordering_fields = ["name", "specialization", "years_of_experience"]
    filterset_fields = ["specialization"]
