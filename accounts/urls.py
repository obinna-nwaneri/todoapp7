from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ChangePasswordView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetView,
    RegisterDoctorView,
    RegisterPatientView,
    UserAdminViewSet,
)

router = DefaultRouter()
router.register(r"users", UserAdminViewSet, basename="admin-users")

urlpatterns = [
    path("register/doctor", RegisterDoctorView.as_view(), name="register-doctor"),
    path("register/patient", RegisterPatientView.as_view(), name="register-patient"),
    path("login", TokenObtainPairView.as_view(), name="login"),
    path("refresh", TokenRefreshView.as_view(), name="token-refresh"),
    path("me", MeView.as_view(), name="me"),
    path("password/reset", PasswordResetView.as_view(), name="password-reset"),
    path("password/reset/confirm", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("password/change", ChangePasswordView.as_view(), name="password-change"),
    path("admin/", include(router.urls)),
]
