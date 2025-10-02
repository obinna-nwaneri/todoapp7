from django.urls import path

from .views import (
    PatientLoginView,
    admin_panel,
    admin_appointment_rows,
    appointment_list_partial,
    book_appointment,
    dashboard,
    delete_doctor,
    doctor_form_partial,
    home,
    logout_view,
    register_view,
    save_doctor,
    update_appointment_status,
    update_profile,
)

urlpatterns = [
    path("", home, name="home"),
    path("register/", register_view, name="register"),
    path("login/", PatientLoginView.as_view(), name="login"),
    path("logout/", logout_view, name="logout"),
    path("dashboard/", dashboard, name="dashboard"),
    path("appointments/create/", book_appointment, name="book_appointment"),
    path("appointments/list/", appointment_list_partial, name="appointment_list_partial"),
    path("profile/update/", update_profile, name="update_profile"),
    path("admin-panel/", admin_panel, name="admin_panel"),
    path(
        "admin-panel/appointments/<int:pk>/status/",
        update_appointment_status,
        name="update_appointment_status",
    ),
    path(
        "admin-panel/appointments/rows/",
        admin_appointment_rows,
        name="admin_appointment_rows",
    ),
    path("admin-panel/doctors/form/", doctor_form_partial, name="doctor_create_form"),
    path(
        "admin-panel/doctors/<int:pk>/form/",
        doctor_form_partial,
        name="doctor_update_form",
    ),
    path("admin-panel/doctors/create/", save_doctor, name="doctor_create"),
    path("admin-panel/doctors/<int:pk>/update/", save_doctor, name="doctor_update"),
    path("admin-panel/doctors/<int:pk>/delete/", delete_doctor, name="doctor_delete"),
]
