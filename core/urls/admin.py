from django.urls import include, path
from rest_framework.routers import DefaultRouter

from appointments.views import AdminAppointmentViewSet
from core.views import AdminAppointmentExportView, AdminReportView, AdminStatsView
from doctors.views import DoctorAdminViewSet, TimeBlockViewSet
from patients.views import PatientAdminViewSet

router = DefaultRouter()
router.register(r"doctors", DoctorAdminViewSet, basename="admin-doctor")
router.register(r"patients", PatientAdminViewSet, basename="admin-patient")
router.register(r"appointments", AdminAppointmentViewSet, basename="admin-appointment")
router.register(r"blocks", TimeBlockViewSet, basename="admin-block")

urlpatterns = [
    path("stats", AdminStatsView.as_view(), name="admin-stats"),
    path("appointments/export", AdminAppointmentExportView.as_view(), name="admin-appointments-export"),
    path("reports/appointments", AdminReportView.as_view(), name="admin-appointments-report"),
    path("", include(router.urls)),
]
