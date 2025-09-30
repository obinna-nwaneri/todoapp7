from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path("", views.HomeView.as_view(), name="home"),
    path("doctors/", views.DoctorListView.as_view(), name="doctor_list"),
    path("doctors/<str:username>/", views.DoctorDetailView.as_view(), name="doctor_detail"),
    path("accounts/register/", views.RegisterView.as_view(), name="register"),
    path(
        "accounts/login/",
        auth_views.LoginView.as_view(template_name="registration/login.html"),
        name="login",
    ),
    path(
        "accounts/logout/",
        auth_views.LogoutView.as_view(),
        name="logout",
    ),
    path(
        "accounts/password_change/",
        views.CustomPasswordChangeView.as_view(),
        name="password_change",
    ),
    path(
        "accounts/password_change/done/",
        views.CustomPasswordChangeDoneView.as_view(),
        name="password_change_done",
    ),
    path("me/appointments/", views.PatientAppointmentListView.as_view(), name="my_appointments"),
    path("appointments/book/", views.AppointmentCreateView.as_view(), name="appointment_book"),
    path("appointments/<int:pk>/", views.AppointmentDetailView.as_view(), name="appointment_detail"),
    path(
        "appointments/<int:pk>/reschedule/",
        views.appointment_reschedule,
        name="appointment_reschedule",
    ),
    path(
        "appointments/<int:pk>/cancel/",
        views.appointment_cancel,
        name="appointment_cancel",
    ),
    path(
        "appointments/<int:pk>/approve/",
        views.appointment_approve,
        name="appointment_approve",
    ),
    path(
        "appointments/<int:pk>/decline/",
        views.appointment_decline,
        name="appointment_decline",
    ),
    path(
        "appointments/<int:pk>/complete/",
        views.appointment_complete,
        name="appointment_complete",
    ),
    path(
        "appointments/<int:pk>/notes/",
        views.appointment_notes,
        name="appointment_notes",
    ),
    path("doctor/availability/", views.DoctorAvailabilityView.as_view(), name="doctor_availability"),
    path("doctor/appointments/", views.DoctorAppointmentListView.as_view(), name="doctor_appointments"),
    path("admin/dashboard/", views.AdminDashboardView.as_view(), name="admin_dashboard"),
    path("admin/dashboard/kpis/", views.dashboard_kpis, name="admin_dashboard_kpis"),
    path("admin/dashboard/today/", views.dashboard_today, name="admin_dashboard_today"),
    path("admin/dashboard/activity/", views.dashboard_activity, name="admin_dashboard_activity"),
]
