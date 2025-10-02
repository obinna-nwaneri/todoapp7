from __future__ import annotations

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, viewsets

from accounts.permissions import IsAdminRole, IsPatientRole
from accounts.serializers import PatientSerializer

from .models import Patient


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related("user")
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "contact_info"]
    ordering_fields = ["name", "age", "gender"]
    filterset_fields = ["gender"]


class PatientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientRole]

    def get_object(self):
        return self.request.user.patient_profile

    def get_queryset(self):
        return Patient.objects.filter(user=self.request.user)
