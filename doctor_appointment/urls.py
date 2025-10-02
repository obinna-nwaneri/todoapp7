from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

from accounts.views import dashboard_redirect

admin.site.site_header = "Doctor Appointment Admin"
admin.site.site_title = "Doctor Appointment Admin"
admin.site.index_title = "Administration"

urlpatterns = [
    path("", RedirectView.as_view(pattern_name="login", permanent=False), name="home"),
    path("accounts/", include("accounts.urls")),
    path("admin-panel/", include(("appointments.admin_urls", "admin-panel"), namespace="admin_panel")),
    path("doctor-panel/", include(("appointments.doctor_urls", "doctor-panel"), namespace="doctor_panel")),
    path("patient-panel/", include(("appointments.patient_urls", "patient-panel"), namespace="patient_panel")),
    path("dashboard/", dashboard_redirect, name="dashboard-redirect"),
    path("django-admin/", admin.site.urls),
]
