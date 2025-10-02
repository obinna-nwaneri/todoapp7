from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminDoctorViewSet, DoctorProfileView, DoctorStatsView, PublicDoctorList, TimeBlockViewSet

router = DefaultRouter()
router.register(r"doctors", AdminDoctorViewSet, basename="admin-doctors")
router.register(r"time-blocks", TimeBlockViewSet, basename="time-blocks")

urlpatterns = [
    path("admin/", include(router.urls)),
    path("doctor/profile", DoctorProfileView.as_view(), name="doctor-profile"),
    path("public/doctors", PublicDoctorList.as_view(), name="public-doctors"),
    path("admin/stats/doctors", DoctorStatsView.as_view(), name="doctor-stats"),
]
