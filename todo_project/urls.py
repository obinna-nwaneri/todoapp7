from django.contrib import admin
from django.urls import include, path

from tasks import views as task_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", task_views.dashboard, name="home"),
    path("", include(("tasks.urls", "tasks"), namespace="tasks")),
    path("accounts/", include("accounts.urls")),
    path("admin-panel/", include("accounts.staff_urls")),
]
