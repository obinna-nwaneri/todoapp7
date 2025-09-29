from django.urls import path

from . import views

urlpatterns = [
    path("", views.admin_dashboard, name="admin_dashboard"),
    path("metrics/", views.admin_metrics_partial, name="admin_metrics_partial"),
    path("activity/", views.admin_activity_partial, name="admin_activity_partial"),
    path("users/", views.users_list, name="admin_users"),
    path("users/add/", views.users_add, name="admin_users_add"),
    path("users/<int:pk>/edit/", views.users_edit, name="admin_users_edit"),
    path("users/<int:pk>/delete/", views.users_delete, name="admin_users_delete"),
    path("tasks/", views.tasks_list_admin, name="admin_tasks"),
]
