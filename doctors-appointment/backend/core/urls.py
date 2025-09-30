from __future__ import annotations

from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from appointments.views import (
    AppointmentViewSet,
    AvailabilityViewSet,
    DoctorViewSet,
    SpecialtyViewSet,
    current_user_view,
    register_view,
)

router = routers.DefaultRouter()
router.register(r"specialties", SpecialtyViewSet, basename="specialty")
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"availabilities", AvailabilityViewSet, basename="availability")
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/auth/register", register_view, name="register"),
    path("api/auth/me", current_user_view, name="current-user"),
    path("api/auth/jwt/create", TokenObtainPairView.as_view(), name="jwt-create"),
    path("api/auth/jwt/refresh", TokenRefreshView.as_view(), name="jwt-refresh"),
]
