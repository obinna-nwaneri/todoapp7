from __future__ import annotations

from django.urls import path

from . import views

app_name = "admin_panel"

urlpatterns = [
    path("", views.admin_dashboard, name="admin_dashboard"),
    path("users/", views.users_list, name="admin_users"),
    path("users/add/", views.users_add, name="admin_users_add"),
    path("users/<int:pk>/edit/", views.users_edit, name="admin_users_edit"),
    path("users/<int:pk>/delete/", views.users_delete, name="admin_users_delete"),
    path("tasks/", views.tasks_list, name="admin_tasks"),
]
