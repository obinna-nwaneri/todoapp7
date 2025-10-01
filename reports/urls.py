from django.urls import path

from . import views

app_name = "admin-panel"

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("users/patients/", views.patients, name="patients"),
    path("users/doctors/", views.doctors, name="doctors"),
    path("appointments/", views.appointments, name="appointments"),
    path("specialties/", views.manage_specialties, name="specialties"),
    path("content/faqs/", views.manage_faqs, name="faqs"),
    path("content/pages/", views.manage_pages, name="pages"),
    path("content/announcements/", views.manage_announcements, name="announcements"),
    path("reports/appointments/", views.appointments_report, name="appointments_report"),
    path("audit-logs/", views.audit_logs, name="audit_logs"),
]

