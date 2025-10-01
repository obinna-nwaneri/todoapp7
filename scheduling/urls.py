from django.urls import include, path

from accounts import views as account_views

from . import views

patient_patterns = [
    path("dashboard/", views.patient_dashboard, name="dashboard"),
    path("appointments/", views.patient_appointments, name="appointments"),
    path("appointments/<int:pk>/", views.appointment_detail, name="appointment_detail"),
    path("appointments/<int:pk>/cancel/", views.cancel_appointment, name="cancel"),
    path("appointments/<int:pk>/reschedule/", views.reschedule_appointment, name="reschedule"),
    path("book/<int:doctor_id>/", views.book_appointment, name="book"),
    path("records/", views.patient_records, name="records"),
    path("profile/", account_views.patient_profile, name="profile"),
]

doctor_patterns = [
    path("dashboard/", views.doctor_dashboard, name="dashboard"),
    path("appointments/", views.doctor_appointments, name="appointments"),
    path("appointments/<int:pk>/<str:status>/", views.doctor_update_status, name="update_status"),
    path("calendar/", views.doctor_calendar, name="calendar"),
    path("patients/", views.doctor_patients, name="patients"),
    path("availability/", views.manage_working_hours, name="availability"),
    path("availability/<int:pk>/delete/", views.delete_working_hour, name="delete_availability"),
    path("time-off/", views.manage_time_off, name="time_off"),
    path("time-off/<int:pk>/delete/", views.delete_time_off, name="delete_time_off"),
    path("profile/", account_views.doctor_profile, name="profile"),
]

urlpatterns = [
    path("patient/", include((patient_patterns, "patient"), namespace="patient")),
    path("doctor/", include((doctor_patterns, "doctor"), namespace="doctor")),
]

