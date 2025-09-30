from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ContactListCreateView,
    ContactRetrieveUpdateDestroyView,
    LoginView,
)

urlpatterns = [
    path("login", LoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("contacts", ContactListCreateView.as_view(), name="contact-list"),
    path("contacts/<int:pk>", ContactRetrieveUpdateDestroyView.as_view(), name="contact-detail"),
]
