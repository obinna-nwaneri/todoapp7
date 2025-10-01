from __future__ import annotations

import csv
from io import StringIO

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from accounts.models import DoctorProfile, PatientProfile, User
from content.models import Announcement, CmsPage, FAQ
from core.models import AuditLog
from directory.models import Specialty
from scheduling.models import Appointment

from .forms import AnnouncementForm, CmsPageForm, FAQForm, SpecialtyForm


@staff_member_required
def dashboard(request: HttpRequest) -> HttpResponse:
    total_patients = PatientProfile.objects.count()
    total_doctors = DoctorProfile.objects.filter(verified=True).count()
    total_appointments = Appointment.objects.count()
    upcoming_today = Appointment.objects.filter(start_datetime__date=timezone.localdate()).count()
    pending_doctors = DoctorProfile.objects.filter(verified=False, user__is_active=False)
    return render(
        request,
        "admin_panel/dashboard.html",
        {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "upcoming_today": upcoming_today,
            "pending_doctors": pending_doctors,
        },
    )


@staff_member_required
def patients(request: HttpRequest) -> HttpResponse:
    patient_users = User.objects.filter(groups__name=User.ROLE_PATIENT).select_related("patientprofile")
    return render(request, "admin_panel/patients.html", {"patients": patient_users})


@staff_member_required
def doctors(request: HttpRequest) -> HttpResponse:
    doctor_profiles = DoctorProfile.objects.select_related("user", "specialty")
    if request.method == "POST":
        doctor = get_object_or_404(doctor_profiles, pk=request.POST.get("doctor_id"))
        action = request.POST.get("action")
        if action == "approve":
            doctor.verified = True
            doctor.user.is_active = True
            doctor.user.save(update_fields=["is_active"])
            doctor.save(update_fields=["verified"])
            messages.success(request, "Doctor approved")
        elif action == "deactivate":
            doctor.user.is_active = False
            doctor.user.save(update_fields=["is_active"])
            messages.success(request, "Doctor deactivated")
    return render(request, "admin_panel/doctors.html", {"doctors": doctor_profiles})


@staff_member_required
def appointments(request: HttpRequest) -> HttpResponse:
    queryset = Appointment.objects.select_related("doctor", "patient")
    doctor_id = request.GET.get("doctor")
    patient_id = request.GET.get("patient")
    status = request.GET.get("status")
    if doctor_id:
        queryset = queryset.filter(doctor_id=doctor_id)
    if patient_id:
        queryset = queryset.filter(patient_id=patient_id)
    if status:
        queryset = queryset.filter(status=status)
    appointments = queryset.order_by("-start_datetime")[:100]
    return render(
        request,
        "admin_panel/appointments.html",
        {
            "appointments": appointments,
            "doctors": DoctorProfile.objects.all(),
            "patients": User.objects.filter(groups__name=User.ROLE_PATIENT),
        },
    )


@staff_member_required
def manage_specialties(request: HttpRequest) -> HttpResponse:
    specialties = Specialty.objects.all()
    if request.method == "POST":
        form = SpecialtyForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Specialty saved")
            return redirect("admin-panel:specialties")
    else:
        form = SpecialtyForm()
    return render(
        request,
        "admin_panel/specialties.html",
        {"specialties": specialties, "form": form},
    )


@staff_member_required
def manage_faqs(request: HttpRequest) -> HttpResponse:
    faqs = FAQ.objects.all()
    if request.method == "POST":
        form = FAQForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "FAQ saved")
            return redirect("admin-panel:faqs")
    else:
        form = FAQForm()
    return render(
        request,
        "admin_panel/faqs.html",
        {"faqs": faqs, "form": form},
    )


@staff_member_required
def manage_pages(request: HttpRequest) -> HttpResponse:
    pages = CmsPage.objects.all()
    if request.method == "POST":
        form = CmsPageForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Page saved")
            return redirect("admin-panel:pages")
    else:
        form = CmsPageForm()
    return render(
        request,
        "admin_panel/pages.html",
        {"pages": pages, "form": form},
    )


@staff_member_required
def manage_announcements(request: HttpRequest) -> HttpResponse:
    announcements = Announcement.objects.all()
    if request.method == "POST":
        form = AnnouncementForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Announcement saved")
            return redirect("admin-panel:announcements")
    else:
        form = AnnouncementForm()
    return render(
        request,
        "admin_panel/announcements.html",
        {"announcements": announcements, "form": form},
    )


@staff_member_required
def appointments_report(request: HttpRequest) -> HttpResponse:
    group_by = request.GET.get("group_by", "day")
    start = request.GET.get("from")
    end = request.GET.get("to")
    queryset = Appointment.objects.all()
    if start:
        queryset = queryset.filter(start_datetime__gte=start)
    if end:
        queryset = queryset.filter(start_datetime__lte=end)
    if group_by == "month":
        date_format = "%Y-%m"
    elif group_by == "week":
        date_format = "%Y-W%W"
    else:
        date_format = "%Y-%m-%d"
    stats = (
        queryset.extra(select={"period": f"strftime('{date_format}', start_datetime)"})
        .values("period")
        .annotate(count=Count("id"))
        .order_by("period")
    )
    if request.GET.get("format") == "csv":
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["period", "appointments"])
        for row in stats:
            writer.writerow([row["period"], row["count"]])
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=appointments.csv"
        return response
    return JsonResponse({"results": list(stats)})


@staff_member_required
def audit_logs(request: HttpRequest) -> HttpResponse:
    logs = AuditLog.objects.select_related("admin").order_by("-created_at")[:200]
    return render(request, "admin_panel/audit_logs.html", {"logs": logs})


