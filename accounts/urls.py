from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AdminUserActivationView,
    DoctorRegisterView,
    MeView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetView,
    PatientRegisterView,
)

urlpatterns = [
    path("register/doctor", DoctorRegisterView.as_view(), name="register-doctor"),
    path("register/patient", PatientRegisterView.as_view(), name="register-patient"),
    path("login", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("me", MeView.as_view(), name="me"),
    path("password/reset", PasswordResetView.as_view(), name="password-reset"),
    path("password/reset/confirm", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("password/change", PasswordChangeView.as_view(), name="password-change"),
    path("admin/user/<int:user_id>/toggle", AdminUserActivationView.as_view(), name="admin-toggle-user"),
]
