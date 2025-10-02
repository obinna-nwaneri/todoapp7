from rest_framework import routers

from .views import AdminAppointmentViewSet, AppointmentViewSet, DoctorViewSet

router = routers.DefaultRouter()
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"appointments", AppointmentViewSet, basename="appointment")
router.register(r"admin/appointments", AdminAppointmentViewSet, basename="admin-appointment")
