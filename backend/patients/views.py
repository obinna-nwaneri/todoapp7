from django.http import Http404
from rest_framework import filters, mixins, permissions, viewsets

from accounts.permissions import IsAdminRole, IsPatientRole
from .models import Patient
from .serializers import PatientProfileSerializer, PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user').all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'contact_info')
    ordering_fields = ('name', 'age')


class PatientProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientRole]

    def get_object(self):
        patient = getattr(self.request.user, 'patient_profile', None)
        if patient is None:
            raise Http404('Patient profile not found.')
        return patient
