from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminAppointmentViewSet,
    AdminDashboardStatsView,
    AppointmentReportView,
    DoctorAppointmentViewSet,
    PatientAppointmentViewSet,
)

router = DefaultRouter()
router.register(r"admin/appointments", AdminAppointmentViewSet, basename="admin-appointments")
router.register(r"doctor/appointments", DoctorAppointmentViewSet, basename="doctor-appointments")
router.register(r"patient/appointments", PatientAppointmentViewSet, basename="patient-appointments")

urlpatterns = [
    path("", include(router.urls)),
    path("admin/dashboard", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
    path("admin/reports/appointments", AppointmentReportView.as_view(), name="appointment-report"),
]
