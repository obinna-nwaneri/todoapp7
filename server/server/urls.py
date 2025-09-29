from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/todos/", include("apps.todos.urls")),
    path("api/activity/", include("apps.activity.urls")),
    path("api/adminpanel/", include("apps.adminpanel.urls")),
]
