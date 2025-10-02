from django.urls import path
from rest_framework.routers import DefaultRouter

from doctors.views import DoctorProfileView
from appointments.views import DoctorAppointmentViewSet

router = DefaultRouter()
router.register(r"appointments", DoctorAppointmentViewSet, basename="doctor-appointments")

urlpatterns = [
    path("profile/", DoctorProfileView.as_view(), name="doctor-profile"),
]
urlpatterns += router.urls
