from __future__ import annotations

from datetime import datetime

from django.db.models import Q
from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_GET
from django.views.generic import DetailView, ListView

from accounts.models import DoctorProfile
from scheduling.services import AvailabilityService

from .models import Specialty


class SpecialtyListView(ListView):
    model = Specialty
    template_name = "directory/specialty_list.html"
    context_object_name = "specialties"


class DoctorListView(ListView):
    model = DoctorProfile
    paginate_by = 10
    template_name = "directory/doctor_list.html"
    context_object_name = "doctors"

    def get_queryset(self):
        queryset = (
            DoctorProfile.objects.select_related("user", "specialty")
            .filter(verified=True, user__is_active=True)
            .order_by("user__last_name")
        )
        specialty = self.request.GET.get("specialty")
        location = self.request.GET.get("location")
        q = self.request.GET.get("q")
        if specialty:
            queryset = queryset.filter(specialty__id=specialty)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q)
                | Q(user__last_name__icontains=q)
                | Q(specialty__name__icontains=q)
            )
        return queryset

    def render_to_response(self, context, **response_kwargs):
        if self.request.headers.get("Hx-Request"):
            html = render_to_string(
                "directory/partials/doctor_results.html",
                context,
                request=self.request,
            )
            return HttpResponse(html)
        return super().render_to_response(context, **response_kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["specialties"] = Specialty.objects.all()
        return context


class DoctorDetailView(DetailView):
    model = DoctorProfile
    template_name = "directory/doctor_detail.html"
    context_object_name = "doctor_profile"

    def get_queryset(self):
        return (
            DoctorProfile.objects.select_related("user", "specialty")
            .filter(verified=True, user__is_active=True)
            .all()
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        service = AvailabilityService(self.object.user)
        context["slots"] = service.upcoming_slots(limit=6)
        context["today"] = timezone.localdate()
        return context


@require_GET
def doctor_availability(request: HttpRequest, pk: int) -> HttpResponse:
    profile = get_object_or_404(DoctorProfile, pk=pk, verified=True)
    date_str = request.GET.get("date")
    if not date_str:
        raise Http404("date required")
    try:
        target_date = timezone.make_aware(datetime.strptime(date_str, "%Y-%m-%d"))
    except ValueError as exc:  # pragma: no cover - defensive
        raise Http404("invalid date") from exc
    service = AvailabilityService(profile.user)
    slots = service.generate_slots(target_date)
    return render(
        request,
        "directory/partials/availability_slots.html",
        {"slots": slots, "doctor": profile.user},
    )


