from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from .views import (
    ChangePasswordView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LogoutView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
