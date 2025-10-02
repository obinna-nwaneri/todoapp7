from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from appointments.api import router as appointments_router

router = routers.DefaultRouter()
router.registry.extend(appointments_router.registry)

urlpatterns = [
    path("admin-panel/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/auth/", include("accounts.urls")),
]
