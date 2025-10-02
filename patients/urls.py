from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminPatientViewSet, PatientProfileView

router = DefaultRouter()
router.register(r"patients", AdminPatientViewSet, basename="admin-patients")

urlpatterns = [
    path("admin/", include(router.urls)),
    path("patient/profile", PatientProfileView.as_view(), name="patient-profile"),
]
