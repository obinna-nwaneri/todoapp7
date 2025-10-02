from django.urls import path

from .views import LoginView, MeView, RefreshView, RegisterDoctorView, RegisterPatientView

urlpatterns = [
    path("register/doctor", RegisterDoctorView.as_view(), name="register-doctor"),
    path("register/patient", RegisterPatientView.as_view(), name="register-patient"),
    path("login", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="token-refresh"),
    path("me", MeView.as_view(), name="me"),
]
