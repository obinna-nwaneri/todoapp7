from django.urls import path

from .views import AnnouncementListView, CmsPageView, FAQListView

app_name = "content"

urlpatterns = [
    path("faqs/", FAQListView.as_view(), name="faqs"),
    path("announcements/", AnnouncementListView.as_view(), name="announcements"),
    path("pages/<slug:slug>/", CmsPageView.as_view(), name="page"),
]

