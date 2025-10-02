from django.http import Http404
from rest_framework import filters, mixins, permissions, viewsets

from accounts.permissions import IsAdminRole, IsDoctorRole
from .models import Doctor
from .serializers import DoctorProfileSerializer, DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user').all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'specialization')
    ordering_fields = ('name', 'specialization', 'years_of_experience')


class DoctorProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctorRole]

    def get_object(self):
        doctor = getattr(self.request.user, 'doctor_profile', None)
        if doctor is None:
            raise Http404('Doctor profile not found.')
        return doctor


class PublicDoctorViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Doctor.objects.select_related('user').all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'specialization')
    ordering_fields = ('name', 'specialization', 'years_of_experience')
