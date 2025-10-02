from django.urls import path

from .views import (
    DoctorRegistrationView,
    EmailTokenObtainPairView,
    MeView,
    PatientRegistrationView,
    RefreshTokenView,
)

app_name = 'accounts-auth'

urlpatterns = [
    path('register/doctor/', DoctorRegistrationView.as_view(), name='register-doctor'),
    path('register/patient/', PatientRegistrationView.as_view(), name='register-patient'),
    path('login/', EmailTokenObtainPairView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='me'),
]
