from django.urls import path

from .views import DoctorPublicListView

urlpatterns = [
    path("", DoctorPublicListView.as_view(), name="public-doctor-list"),
]
