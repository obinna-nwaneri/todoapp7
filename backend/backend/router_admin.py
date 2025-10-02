from django.urls import include, path
from rest_framework import routers

from doctors.views import DoctorViewSet
from patients.views import PatientViewSet
from appointments.views import AppointmentViewSet
from .views_admin import AdminStatsView

router = routers.DefaultRouter()
router.register(r"doctors", DoctorViewSet, basename="admin-doctors")
router.register(r"patients", PatientViewSet, basename="admin-patients")
router.register(r"appointments", AppointmentViewSet, basename="admin-appointments")

urlpatterns = [
    path("", include(router.urls)),
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
]
