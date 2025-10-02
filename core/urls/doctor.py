from django.urls import include, path
from rest_framework.routers import DefaultRouter

from appointments.views import DoctorAppointmentViewSet
from core.views import DoctorDashboardView
from doctors.views import DoctorProfileView

router = DefaultRouter()
router.register(r"appointments", DoctorAppointmentViewSet, basename="doctor-appointments")

urlpatterns = [
    path("dashboard", DoctorDashboardView.as_view(), name="doctor-dashboard"),
    path("profile", DoctorProfileView.as_view(), name="doctor-profile"),
    path("", include(router.urls)),
]
