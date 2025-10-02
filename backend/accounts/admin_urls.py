from django.urls import include, path
from rest_framework.routers import DefaultRouter

from appointments.views import AdminAppointmentViewSet
from doctors.views import DoctorViewSet
from patients.views import PatientViewSet
from .views import AdminStatsView

router = DefaultRouter()
router.register('doctors', DoctorViewSet, basename='admin-doctors')
router.register('patients', PatientViewSet, basename='admin-patients')
router.register('appointments', AdminAppointmentViewSet, basename='admin-appointments')

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]
