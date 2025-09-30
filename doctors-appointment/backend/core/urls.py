"""URL configuration for the API."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from appointments import views as appointment_views

router = routers.DefaultRouter()
router.register(r"specialties", appointment_views.SpecialtyViewSet, basename="specialty")
router.register(r"doctors", appointment_views.DoctorViewSet, basename="doctor")
router.register(r"availabilities", appointment_views.AvailabilityViewSet, basename="availability")
router.register(r"appointments", appointment_views.AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(([
        path("", include(router.urls)),
        path("auth/register", appointment_views.register, name="register"),
        path("auth/me", appointment_views.me, name="me"),
        path("auth/jwt/create", appointment_views.CustomTokenObtainPairView.as_view(), name="jwt-create"),
        path("auth/jwt/refresh", appointment_views.CustomTokenRefreshView.as_view(), name="jwt-refresh"),
    ], "api"))),
]
