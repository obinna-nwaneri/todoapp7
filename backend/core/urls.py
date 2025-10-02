from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DoctorViewSet,
    PatientViewSet,
    AppointmentViewSet,
    DoctorRegistrationView,
    PatientRegistrationView,
    CustomTokenObtainPairView,
    CurrentUserView,
    AdminDashboardView,
    DoctorDashboardView,
    PatientDashboardView,
)

router = DefaultRouter()
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/register/doctor/", DoctorRegistrationView.as_view(), name="doctor_register"),
    path("auth/register/patient/", PatientRegistrationView.as_view(), name="patient_register"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("dashboard/admin/", AdminDashboardView.as_view(), name="admin_dashboard"),
    path("dashboard/doctor/", DoctorDashboardView.as_view(), name="doctor_dashboard"),
    path("dashboard/patient/", PatientDashboardView.as_view(), name="patient_dashboard"),
    path("", include(router.urls)),
]
