from django.urls import path
from rest_framework.routers import DefaultRouter

from patients.views import PatientProfileView
from appointments.views import PatientAppointmentViewSet

router = DefaultRouter()
router.register(r"appointments", PatientAppointmentViewSet, basename="patient-appointments")

urlpatterns = [
    path("profile/", PatientProfileView.as_view(), name="patient-profile"),
]
urlpatterns += router.urls
