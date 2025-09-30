"""URL configuration for the API."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from appointments.views import (
    AdminRegistrationView,
    AppointmentViewSet,
    AvailabilityViewSet,
    DoctorViewSet,
    MeView,
    PatientRegistrationView,
    SpecialtyViewSet,
)

router = routers.DefaultRouter()
router.register(r"specialties", SpecialtyViewSet, basename="specialty")
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"availabilities", AvailabilityViewSet, basename="availability")
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include([
        path("", include(router.urls)),
        path("auth/register", PatientRegistrationView.as_view(), name="auth-register"),
        path("auth/admin/register", AdminRegistrationView.as_view(), name="auth-admin-register"),
        path("auth/jwt/create/", TokenObtainPairView.as_view(), name="jwt-create"),
        path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
        path("auth/me", MeView.as_view(), name="auth-me"),
    ])),
]
