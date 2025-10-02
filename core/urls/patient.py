from django.urls import include, path
from rest_framework.routers import DefaultRouter

from appointments.views import PatientAppointmentViewSet
from core.views import PatientDashboardView
from patients.views import PatientProfileView

router = DefaultRouter()
router.register(r"appointments", PatientAppointmentViewSet, basename="patient-appointments")

urlpatterns = [
    path("dashboard", PatientDashboardView.as_view(), name="patient-dashboard"),
    path("profile", PatientProfileView.as_view(), name="patient-profile"),
    path("", include(router.urls)),
]
