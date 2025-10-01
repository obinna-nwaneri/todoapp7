from __future__ import annotations

from datetime import datetime

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from accounts.models import DoctorProfile, User
from core.decorators import role_required
from records.models import Prescription

from .forms import (
    AppointmentBookingForm,
    RescheduleForm,
    TimeOffForm,
    WorkingHoursForm,
)
from .models import Appointment, TimeOff, WorkingHours
from .services import AppointmentService, AvailabilityService, DoctorScheduleService


patient_required = role_required(lambda u: u.is_patient())
doctor_required = role_required(lambda u: u.is_doctor(), redirect_to="accounts:login")


@login_required
@patient_required
def patient_dashboard(request: HttpRequest) -> HttpResponse:
    appointments = (
        request.user.patient_appointments.select_related("doctor")
        .filter(status__in=["PENDING", "CONFIRMED"], start_datetime__gte=timezone.now())
        .order_by("start_datetime")
    )[:5]
    notifications = request.user.notification_set.all()[:5]
    return render(
        request,
        "patient/dashboard.html",
        {"appointments": appointments, "notifications": notifications},
    )


@login_required
@patient_required
def patient_appointments(request: HttpRequest) -> HttpResponse:
    appointments = request.user.patient_appointments.select_related("doctor").all()
    return render(
        request,
        "patient/appointments.html",
        {"appointments": appointments},
    )


@login_required
@patient_required
def appointment_detail(request: HttpRequest, pk: int) -> HttpResponse:
    appointment = get_object_or_404(
        Appointment.objects.select_related("doctor"), pk=pk, patient=request.user
    )
    return render(
        request,
        "patient/appointment_detail.html",
        {"appointment": appointment},
    )


@login_required
@patient_required
def book_appointment(request: HttpRequest, doctor_id: int) -> HttpResponse:
    doctor = get_object_or_404(
        User.objects.filter(groups__name=User.ROLE_DOCTOR, doctorprofile__verified=True),
        pk=doctor_id,
    )
    profile = doctor.doctorprofile
    availability_service = AvailabilityService(doctor)
    if request.method == "POST":
        form = AppointmentBookingForm(request.POST)
        if form.is_valid():
            start: datetime = form.cleaned_data["start"]
            appointment_type = form.cleaned_data["appointment_type"]
            reason = form.cleaned_data.get("reason", "")
            service = AppointmentService(request.user, doctor)
            try:
                appointment = service.book(start, appointment_type, reason)
                messages.success(request, "Appointment requested. Await confirmation.")
                return redirect("patient:appointments")
            except Exception as exc:  # pragma: no cover - handled via messaging
                messages.error(request, str(exc))
    else:
        form = AppointmentBookingForm(initial={"doctor_id": doctor.pk})
    date_str = request.GET.get("date")
    date = timezone.localdate()
    if date_str:
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            pass
    slots = availability_service.generate_slots(timezone.make_aware(datetime.combine(date, datetime.min.time())))
    if request.headers.get("Hx-Request"):
        html = render_to_string(
            "patient/partials/slot_options.html",
            {"slots": slots, "doctor": doctor},
            request=request,
        )
        return HttpResponse(html)
    return render(
        request,
        "patient/book_appointment.html",
        {"doctor": doctor, "profile": profile, "slots": slots, "form": form},
    )


@login_required
@patient_required
@require_POST
def cancel_appointment(request: HttpRequest, pk: int) -> HttpResponse:
    appointment = get_object_or_404(
        Appointment.objects.select_related("doctor"), pk=pk, patient=request.user
    )
    if not appointment.can_cancel():
        messages.error(request, "Cancellation window has passed")
    else:
        appointment.status = "CANCELLED"
        appointment.save(update_fields=["status", "updated_at"])
        messages.success(request, "Appointment cancelled")
    if request.headers.get("Hx-Request"):
        html = render_to_string(
            "patient/partials/appointment_row.html",
            {"appointment": appointment},
            request=request,
        )
        return HttpResponse(html)
    return redirect("patient:appointments")


@login_required
@patient_required
def reschedule_appointment(request: HttpRequest, pk: int) -> HttpResponse:
    appointment = get_object_or_404(
        Appointment.objects.select_related("doctor"), pk=pk, patient=request.user
    )
    service = AppointmentService(request.user, appointment.doctor)
    if request.method == "POST":
        form = RescheduleForm(request.POST)
        if form.is_valid():
            new_start = form.cleaned_data["new_start"]
            try:
                service.reschedule(appointment, new_start)
                messages.success(request, "Appointment rescheduled")
                return redirect("patient:appointments")
            except Exception as exc:
                messages.error(request, str(exc))
    else:
        form = RescheduleForm(initial={"new_start": appointment.start_datetime})
    availability = AvailabilityService(appointment.doctor)
    slots = availability.generate_slots(appointment.start_datetime)
    return render(
        request,
        "patient/reschedule.html",
        {"appointment": appointment, "slots": slots, "form": form},
    )


@login_required
@patient_required
def patient_records(request: HttpRequest) -> HttpResponse:
    prescriptions = Prescription.objects.filter(appointment__patient=request.user)
    return render(
        request,
        "patient/records.html",
        {"prescriptions": prescriptions},
    )


@login_required
@doctor_required
def doctor_dashboard(request: HttpRequest) -> HttpResponse:
    appointments = (
        request.user.doctor_appointments.select_related("patient")
        .filter(start_datetime__gte=timezone.now())
        .order_by("start_datetime")[:5]
    )
    patients = (
        request.user.doctor_appointments.filter(status="COMPLETED")
        .values("patient__first_name", "patient__last_name")
        .distinct()[:5]
    )
    return render(
        request,
        "doctor/dashboard.html",
        {"appointments": appointments, "patients": patients},
    )


@login_required
@doctor_required
def doctor_appointments(request: HttpRequest) -> HttpResponse:
    appointments = request.user.doctor_appointments.select_related("patient").all()
    return render(
        request,
        "doctor/appointments.html",
        {"appointments": appointments},
    )


@login_required
@doctor_required
def doctor_patients(request: HttpRequest) -> HttpResponse:
    patients = (
        User.objects.filter(patient_appointments__doctor=request.user)
        .distinct()
        .order_by("first_name")
    )
    return render(
        request,
        "doctor/patients.html",
        {"patients": patients},
    )


@login_required
@doctor_required
def doctor_calendar(request: HttpRequest) -> HttpResponse:
    day_str = request.GET.get("day")
    if day_str:
        try:
            day = timezone.make_aware(datetime.strptime(day_str, "%Y-%m-%d"))
        except ValueError:
            day = timezone.localtime()
    else:
        day = timezone.localtime()
    appointments = request.user.doctor_appointments.for_day(day).select_related("patient")
    return render(
        request,
        "doctor/calendar.html",
        {"appointments": appointments, "day": day.date()},
    )


@login_required
@doctor_required
@require_POST
def doctor_update_status(request: HttpRequest, pk: int, status: str) -> HttpResponse:
    appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user)
    scheduler = DoctorScheduleService(request.user)
    try:
        if status == "confirm":
            scheduler.confirm(appointment)
        elif status == "cancel":
            scheduler.cancel(appointment, request.POST.get("reason"))
        elif status == "complete":
            scheduler.complete(appointment)
        else:
            raise Http404
    except Exception as exc:
        messages.error(request, str(exc))
    if request.headers.get("Hx-Request"):
        html = render_to_string(
            "doctor/partials/appointment_row.html",
            {"appointment": appointment},
            request=request,
        )
        return HttpResponse(html)
    return redirect("doctor:appointments")


@login_required
@doctor_required
def manage_working_hours(request: HttpRequest) -> HttpResponse:
    hours = request.user.working_hours.all().order_by("day_of_week")
    if request.method == "POST":
        form = WorkingHoursForm(request.POST)
        if form.is_valid():
            wh = form.save(commit=False)
            wh.doctor = request.user
            wh.save()
            messages.success(request, "Availability added")
            return redirect("doctor:availability")
    else:
        form = WorkingHoursForm()
    return render(
        request,
        "doctor/availability.html",
        {"hours": hours, "form": form},
    )


@login_required
@doctor_required
def manage_time_off(request: HttpRequest) -> HttpResponse:
    time_off = request.user.time_off.all().order_by("-start_datetime")
    if request.method == "POST":
        form = TimeOffForm(request.POST)
        if form.is_valid():
            entry = form.save(commit=False)
            entry.doctor = request.user
            entry.save()
            messages.success(request, "Time off added")
            return redirect("doctor:time_off")
    else:
        form = TimeOffForm()
    return render(
        request,
        "doctor/time_off.html",
        {"time_off": time_off, "form": form},
    )


@login_required
@doctor_required
def delete_working_hour(request: HttpRequest, pk: int) -> HttpResponse:
    hour = get_object_or_404(WorkingHours, pk=pk, doctor=request.user)
    hour.delete()
    messages.success(request, "Availability removed")
    return redirect("doctor:availability")


@login_required
@doctor_required
def delete_time_off(request: HttpRequest, pk: int) -> HttpResponse:
    entry = get_object_or_404(TimeOff, pk=pk, doctor=request.user)
    entry.delete()
    messages.success(request, "Time off removed")
    return redirect("doctor:time_off")


