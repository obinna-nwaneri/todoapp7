from django.urls import include, path

from tasks.admin import admin_site

urlpatterns = [
    path("admin/", admin_site.urls),
    path("api/", include("tasks.urls")),
]
