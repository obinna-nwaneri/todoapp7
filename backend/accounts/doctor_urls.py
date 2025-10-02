from django.urls import include, path
from rest_framework.routers import DefaultRouter

from appointments.views import DoctorAppointmentViewSet
from doctors.views import DoctorProfileViewSet

router = DefaultRouter()
router.register('appointments', DoctorAppointmentViewSet, basename='doctor-appointments')

profile_view = DoctorProfileViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
})

urlpatterns = [
    path('profile/', profile_view, name='doctor-profile'),
    path('', include(router.urls)),
]
