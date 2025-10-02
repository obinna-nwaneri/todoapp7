from django.contrib.auth.views import LogoutView
from django.urls import path

from .views import RoleLoginView

urlpatterns = [
    path("login/", RoleLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
