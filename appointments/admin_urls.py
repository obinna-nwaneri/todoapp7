from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/", views.admin_dashboard, name="dashboard"),
    path("doctors/", views.admin_doctor_list, name="doctor-list"),
    path("doctors/create/", views.admin_doctor_form, name="doctor-create"),
    path("doctors/<int:pk>/edit/", views.admin_doctor_form, name="doctor-edit"),
    path("doctors/<int:pk>/delete/", views.admin_doctor_delete, name="doctor-delete"),
    path("patients/", views.admin_patient_list, name="patient-list"),
    path("patients/create/", views.admin_patient_form, name="patient-create"),
    path("patients/<int:pk>/edit/", views.admin_patient_form, name="patient-edit"),
    path("patients/<int:pk>/delete/", views.admin_patient_delete, name="patient-delete"),
    path("appointments/", views.admin_appointment_list, name="appointment-list"),
    path("appointments/create/", views.admin_appointment_form, name="appointment-create"),
    path("appointments/<int:pk>/edit/", views.admin_appointment_form, name="appointment-edit"),
    path("appointments/<int:pk>/delete/", views.admin_appointment_delete, name="appointment-delete"),
]
