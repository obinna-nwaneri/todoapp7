from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError

from accounts.permissions import IsAdminRole, IsDoctorRole, IsPatientRole
from .models import Appointment
from .serializers import AppointmentSerializer


class BaseAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    search_fields = (
        'symptoms',
        'doctor__user__email',
        'patient__user__email',
    )
    filterset_fields = ('status', 'doctor', 'patient', 'date')
    ordering_fields = ('date', 'time', 'status', 'created_at')

    def get_queryset(self):
        return Appointment.objects.select_related('doctor__user', 'patient__user')


class AdminAppointmentViewSet(BaseAppointmentViewSet):
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]


class DoctorAppointmentViewSet(BaseAppointmentViewSet):
    permission_classes = [permissions.IsAuthenticated, IsDoctorRole]

    def get_queryset(self):
        doctor = getattr(self.request.user, 'doctor_profile', None)
        if doctor is None:
            return Appointment.objects.none()
        return super().get_queryset().filter(doctor=doctor)

    def create(self, request, *args, **kwargs):
        raise PermissionDenied('Doctors cannot create appointments.')

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied('Doctors cannot delete appointments.')

    def update(self, request, *args, **kwargs):
        if set(request.data.keys()) - {'status'}:
            raise ValidationError('Doctors may update only the status field.')
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if set(request.data.keys()) - {'status'}:
            raise ValidationError('Doctors may update only the status field.')
        return super().partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        appointment = serializer.instance
        doctor = self.request.user.doctor_profile
        if appointment.doctor != doctor:
            raise PermissionDenied('You may only manage your own appointments.')
        serializer.save()


class PatientAppointmentViewSet(BaseAppointmentViewSet):
    permission_classes = [permissions.IsAuthenticated, IsPatientRole]

    def get_queryset(self):
        patient = getattr(self.request.user, 'patient_profile', None)
        if patient is None:
            return Appointment.objects.none()
        return super().get_queryset().filter(patient=patient)

    def perform_create(self, serializer):
        patient = getattr(self.request.user, 'patient_profile', None)
        if patient is None:
            raise ValidationError('Patient profile not found.')
        doctor = serializer.validated_data.get('doctor')
        if doctor is None:
            raise ValidationError({'doctor': 'Doctor is required.'})
        serializer.save(patient=patient, status=Appointment.Status.PENDING)

    def update(self, request, *args, **kwargs):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            raise ValidationError('Only pending appointments can be updated.')
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            raise ValidationError('Only pending appointments can be updated.')
        if 'status' in request.data and request.data['status'] != appointment.status:
            raise ValidationError('Patients cannot change appointment status.')
        return super().partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        patient = self.request.user.patient_profile
        serializer.save(patient=patient, status=serializer.instance.status)

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        if appointment.status != Appointment.Status.PENDING:
            raise ValidationError('Only pending appointments can be cancelled.')
        return super().destroy(request, *args, **kwargs)
