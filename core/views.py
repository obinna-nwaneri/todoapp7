from __future__ import annotations

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.views.generic import TemplateView

from accounts.models import DoctorProfile, User
from directory.models import Specialty


class HomeView(TemplateView):
    template_name = "public/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["featured_specialties"] = Specialty.objects.filter(featured=True)[:4]
        context["top_doctors"] = DoctorProfile.objects.filter(verified=True)[:4]
        return context


@login_required
def dashboard(request):
    user: User = request.user
    if user.is_superuser or user.is_staff:
        return redirect("admin-panel:dashboard")
    if user.is_doctor():
        return redirect("doctor:dashboard")
    return redirect("patient:dashboard")


class AboutView(TemplateView):
    template_name = "public/about.html"


