from django.urls import path

from doctors.views import PublicDoctorListView

urlpatterns = [
    path("doctors", PublicDoctorListView.as_view(), name="public-doctors"),
]
