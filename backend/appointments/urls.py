from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminAppointmentViewSet,
    ChangePasswordView,
    DoctorViewSet,
    EmailTokenObtainPairView,
    PatientAppointmentsView,
    PatientListView,
    ProfileView,
    RegistrationView,
)

router = DefaultRouter()
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"admin/appointments", AdminAppointmentViewSet, basename="admin-appointments")

urlpatterns = [
    path("auth/register/", RegistrationView.as_view(), name="register"),
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("patient/profile/", ProfileView.as_view(), name="profile"),
    path("patient/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("patient/appointments/", PatientAppointmentsView.as_view(), name="patient-appointments"),
    path("admin/patients/", PatientListView.as_view(), name="admin-patients"),
    path("", include(router.urls)),
]
