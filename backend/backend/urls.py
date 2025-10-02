from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/public/doctors/", include("doctors.public_urls")),
    path("api/admin/", include("backend.router_admin")),
    path("api/doctor/", include("backend.router_doctor")),
    path("api/patient/", include("backend.router_patient")),
]
