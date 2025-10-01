from django.contrib.auth.views import LogoutView
from django.urls import path

from .views import LoginView, doctor_profile, register_doctor, register_patient

app_name = "accounts"

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register-patient/", register_patient, name="register_patient"),
    path("register-doctor/", register_doctor, name="register_doctor"),
]

