from django.db import models
from django.utils import timezone
from rest_framework import mixins, response, viewsets
from rest_framework.decorators import action

from .models import Appointment, Doctor
from .permissions import IsAdminOrReadOnly, IsAdminUser
from .serializers import (
    AdminAppointmentSerializer,
    AppointmentHistorySerializer,
    AppointmentSerializer,
    AppointmentStatusSerializer,
    DoctorSerializer,
)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("name")
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminOrReadOnly]


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return (
            Appointment.objects.select_related("doctor")
            .filter(patient=self.request.user)
            .order_by("date", "time")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    @action(detail=False, methods=["get"], url_path="upcoming")
    def upcoming(self, request):
        today = timezone.localdate()
        now_time = timezone.localtime().time()
        queryset = self.get_queryset()
        upcoming = queryset.filter(
            models.Q(date__gt=today) | (models.Q(date=today) & models.Q(time__gte=now_time))
        )
        serializer = AppointmentHistorySerializer(upcoming, many=True)
        return response.Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        today = timezone.localdate()
        now_time = timezone.localtime().time()
        queryset = self.get_queryset()
        history = queryset.exclude(
            models.Q(date__gt=today) | (models.Q(date=today) & models.Q(time__gte=now_time))
        )
        serializer = AppointmentHistorySerializer(history, many=True)
        return response.Response(serializer.data)


class AdminAppointmentViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor").all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return AppointmentStatusSerializer
        return AdminAppointmentSerializer

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)
