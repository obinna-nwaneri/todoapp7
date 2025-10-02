from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("core.urls.admin")),
    path("api/doctor/", include("core.urls.doctor")),
    path("api/patient/", include("core.urls.patient")),
    path("api/public/", include("core.urls.public")),
]
