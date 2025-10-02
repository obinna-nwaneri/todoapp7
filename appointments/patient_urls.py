from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/", views.patient_dashboard, name="dashboard"),
    path("appointments/", views.patient_appointments, name="appointments"),
    path("appointments/create/", views.patient_appointment_form, name="appointment-create"),
    path("appointments/<int:pk>/edit/", views.patient_appointment_form, name="appointment-edit"),
    path("appointments/<int:pk>/delete/", views.patient_appointment_delete, name="appointment-delete"),
]
