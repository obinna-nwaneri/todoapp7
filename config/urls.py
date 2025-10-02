from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin-panel/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include("appointments.urls")),
]
