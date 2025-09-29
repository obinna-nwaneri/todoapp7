from django.urls import path

from . import views

app_name = 'staff'

urlpatterns = [
    path('', views.staff_user_list, name='staff_home'),
    path('users/', views.staff_user_list, name='staff_users'),
    path('users/add/', views.staff_user_create, name='staff_users_add'),
    path('users/<int:pk>/edit/', views.staff_user_edit, name='staff_users_edit'),
    path('users/<int:pk>/delete/', views.staff_user_delete, name='staff_users_delete'),
    path('tasks/', views.staff_task_list, name='staff_tasks'),
    path('tasks/<int:pk>/edit/', views.staff_task_edit, name='staff_tasks_edit'),
    path('tasks/<int:pk>/delete/', views.staff_task_delete, name='staff_tasks_delete'),
]
