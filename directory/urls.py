from django.urls import path

from .views import DoctorDetailView, DoctorListView, SpecialtyListView, doctor_availability

app_name = "directory"

urlpatterns = [
    path("specialties/", SpecialtyListView.as_view(), name="specialty_list"),
    path("doctors/", DoctorListView.as_view(), name="doctor_list"),
    path("doctors/<int:pk>/", DoctorDetailView.as_view(), name="doctor_detail"),
    path(
        "doctors/<int:pk>/availability/",
        doctor_availability,
        name="doctor_availability",
    ),
]

