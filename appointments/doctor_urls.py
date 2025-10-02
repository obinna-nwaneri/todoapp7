from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/", views.doctor_dashboard, name="dashboard"),
    path("appointments/", views.doctor_appointments, name="appointments"),
    path("appointments/<int:pk>/status/", views.doctor_update_status, name="appointment-status"),
]
