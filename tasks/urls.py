from django.urls import path

from .views import dashboard, task_create, task_delete, task_edit

app_name = "tasks"

urlpatterns = [
    path("", dashboard, name="home"),
    path("dashboard/", dashboard, name="dashboard"),
    path("tasks/add/", task_create, name="task_add"),
    path("tasks/<int:pk>/edit/", task_edit, name="task_edit"),
    path("tasks/<int:pk>/delete/", task_delete, name="task_delete"),
]
