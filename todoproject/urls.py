from django.contrib import admin
from django.urls import include, path

from tasks.views import (
    CustomLoginView,
    CustomLogoutView,
    CustomPasswordChangeDoneView,
    CustomPasswordChangeView,
    HomeView,
    SignUpView,
    admin_dashboard,
    admin_dashboard_kpis,
    admin_dashboard_recent,
    admin_dashboard_users,
)

accounts_patterns = ([
    path("register/", SignUpView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("logout/", CustomLogoutView.as_view(), name="logout"),
    path("password_change/", CustomPasswordChangeView.as_view(), name="password_change"),
    path(
        "password_change/done/",
        CustomPasswordChangeDoneView.as_view(),
        name="password_change_done",
    ),
], "accounts")

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    path("tasks/", include("tasks.urls")),
    path("accounts/", include(accounts_patterns, namespace="accounts")),
    path("admin/dashboard/", admin_dashboard, name="admin-dashboard"),
    path("admin/dashboard/kpis/", admin_dashboard_kpis, name="admin-dashboard-kpis"),
    path("admin/dashboard/recent/", admin_dashboard_recent, name="admin-dashboard-recent"),
    path("admin/dashboard/users/", admin_dashboard_users, name="admin-dashboard-users"),
    path("django-admin/", admin.site.urls),
]
