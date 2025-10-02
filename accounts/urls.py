from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import DoctorRegistrationView, PatientRegistrationView, RoleRedirectView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/register/doctor/", DoctorRegistrationView.as_view(), name="register_doctor"),
    path("auth/register/patient/", PatientRegistrationView.as_view(), name="register_patient"),
    path("auth/redirect/", RoleRedirectView.as_view(), name="role_redirect"),
    path("", include(router.urls)),
]
