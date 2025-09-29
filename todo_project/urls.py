from django.contrib import admin
from django.urls import include, path

from tasks.views import dashboard

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", dashboard, name="home"),
    path("", include("tasks.urls")),
    path("accounts/", include("accounts.urls")),
    path("admin-panel/", include("accounts.staff_urls")),
]
