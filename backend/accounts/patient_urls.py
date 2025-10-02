from django.urls import include, path
from rest_framework.routers import DefaultRouter

from appointments.views import PatientAppointmentViewSet
from patients.views import PatientProfileViewSet

router = DefaultRouter()
router.register('appointments', PatientAppointmentViewSet, basename='patient-appointments')

profile_view = PatientProfileViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
})

urlpatterns = [
    path('profile/', profile_view, name='patient-profile'),
    path('', include(router.urls)),
]
