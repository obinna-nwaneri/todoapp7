from __future__ import annotations

from django.views.generic import DetailView, ListView

from .models import Announcement, CmsPage, FAQ


class FAQListView(ListView):
    model = FAQ
    template_name = "content/faq_list.html"
    context_object_name = "faqs"


class CmsPageView(DetailView):
    model = CmsPage
    slug_field = "slug"
    slug_url_kwarg = "slug"
    template_name = "content/page.html"
    context_object_name = "page"


class AnnouncementListView(ListView):
    model = Announcement
    template_name = "content/announcements.html"
    context_object_name = "announcements"

    def get_queryset(self):
        queryset = super().get_queryset()
        audience = "ALL"
        if self.request.user.is_authenticated:
            if self.request.user.is_doctor():
                audience = "DOCTORS"
            else:
                audience = "PATIENTS"
        return queryset.filter(audience__in=["ALL", audience])


