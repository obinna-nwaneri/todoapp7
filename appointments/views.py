from datetime import date
import json

from django.contrib import messages
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.http import HttpResponse

from accounts.views import ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT
from .decorators import role_required
from .forms import (
    AdminAppointmentForm,
    AppointmentForm,
    AppointmentStatusForm,
    DoctorForm,
    PatientForm,
)
from .models import Appointment, Doctor, Patient
from .utils import assign_role, remove_role


def is_htmx(request):
    return request.headers.get("HX-Request") == "true" or request.headers.get("Hx-Request") == "true"


# Admin views
@role_required(ROLE_ADMIN)
def admin_dashboard(request):
    stats = {
        "doctor_count": Doctor.objects.count(),
        "patient_count": Patient.objects.count(),
        "appointment_count": Appointment.objects.count(),
        "pending_count": Appointment.objects.filter(status=Appointment.STATUS_PENDING).count(),
    }
    recent_appointments = (
        Appointment.objects.select_related("doctor", "patient")
        .order_by("-created_at")[:5]
    )
    return render(
        request,
        "appointments/admin/dashboard.html",
        {"stats": stats, "recent_appointments": recent_appointments},
    )


@role_required(ROLE_ADMIN)
def admin_doctor_list(request):
    query = request.GET.get("q", "").strip()
    doctors = Doctor.objects.select_related("user")
    if query:
        doctors = doctors.filter(Q(name__icontains=query) | Q(specialization__icontains=query))
    context = {"doctors": doctors, "query": query}
    if is_htmx(request):
        html = render_to_string("appointments/admin/partials/doctor_table.html", context, request=request)
        return HttpResponse(html)
    return render(request, "appointments/admin/doctor_list.html", context)


@role_required(ROLE_ADMIN)
def admin_doctor_form(request, pk=None):
    doctor = Doctor.objects.filter(pk=pk).first()
    old_user = doctor.user if doctor else None
    if request.method == "POST":
        form = DoctorForm(request.POST, instance=doctor)
        if form.is_valid():
            doctor = form.save()
            assign_role(doctor.user, ROLE_DOCTOR)
            if old_user and old_user != doctor.user:
                remove_role(old_user, ROLE_DOCTOR)
            messages.success(request, "Doctor saved successfully.")
            return redirect("admin_panel:doctor-list")
    else:
        form = DoctorForm(instance=doctor)
    return render(request, "appointments/admin/doctor_form.html", {"form": form, "doctor": doctor})


@role_required(ROLE_ADMIN)
def admin_doctor_delete(request, pk):
    doctor = get_object_or_404(Doctor, pk=pk)
    user = doctor.user
    doctor.delete()
    remove_role(user, ROLE_DOCTOR)
    messages.success(request, "Doctor removed.")
    return redirect("admin_panel:doctor-list")


@role_required(ROLE_ADMIN)
def admin_patient_list(request):
    query = request.GET.get("q", "").strip()
    patients = Patient.objects.select_related("user")
    if query:
        patients = patients.filter(Q(name__icontains=query) | Q(contact_info__icontains=query))
    context = {"patients": patients, "query": query}
    if is_htmx(request):
        html = render_to_string("appointments/admin/partials/patient_table.html", context, request=request)
        return HttpResponse(html)
    return render(request, "appointments/admin/patient_list.html", context)


@role_required(ROLE_ADMIN)
def admin_patient_form(request, pk=None):
    patient = Patient.objects.filter(pk=pk).first()
    old_user = patient.user if patient else None
    if request.method == "POST":
        form = PatientForm(request.POST, instance=patient)
        if form.is_valid():
            patient = form.save()
            assign_role(patient.user, ROLE_PATIENT)
            if old_user and old_user != patient.user:
                remove_role(old_user, ROLE_PATIENT)
            messages.success(request, "Patient saved successfully.")
            return redirect("admin_panel:patient-list")
    else:
        form = PatientForm(instance=patient)
    return render(request, "appointments/admin/patient_form.html", {"form": form, "patient": patient})


@role_required(ROLE_ADMIN)
def admin_patient_delete(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    user = patient.user
    patient.delete()
    remove_role(user, ROLE_PATIENT)
    messages.success(request, "Patient removed.")
    return redirect("admin_panel:patient-list")


@role_required(ROLE_ADMIN)
def admin_appointment_list(request):
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "")
    appointments = Appointment.objects.select_related("doctor", "patient")
    if query:
        appointments = appointments.filter(
            Q(patient__name__icontains=query)
            | Q(doctor__name__icontains=query)
            | Q(symptoms__icontains=query)
        )
    if status:
        appointments = appointments.filter(status=status)
    context = {"appointments": appointments, "query": query, "status": status}
    if is_htmx(request):
        html = render_to_string("appointments/admin/partials/appointment_table.html", context, request=request)
        return HttpResponse(html)
    return render(request, "appointments/admin/appointment_list.html", context)


@role_required(ROLE_ADMIN)
def admin_appointment_form(request, pk=None):
    appointment = Appointment.objects.filter(pk=pk).first()
    if request.method == "POST":
        form = AdminAppointmentForm(request.POST, instance=appointment)
        if form.is_valid():
            form.save()
            messages.success(request, "Appointment saved successfully.")
            return redirect("admin_panel:appointment-list")
    else:
        form = AdminAppointmentForm(instance=appointment)
    return render(
        request,
        "appointments/admin/appointment_form.html",
        {"form": form, "appointment": appointment},
    )


@role_required(ROLE_ADMIN)
def admin_appointment_delete(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    appointment.delete()
    messages.success(request, "Appointment removed.")
    return redirect("admin_panel:appointment-list")


# Doctor views
@role_required(ROLE_DOCTOR)
def doctor_dashboard(request):
    doctor = get_object_or_404(Doctor, user=request.user)
    today = date.today()
    upcoming = (
        Appointment.objects.filter(doctor=doctor, date__gte=today)
        .select_related("patient")
        .order_by("date", "time")[:10]
    )
    stats = {
        "pending": Appointment.objects.filter(doctor=doctor, status=Appointment.STATUS_PENDING).count(),
        "approved": Appointment.objects.filter(doctor=doctor, status=Appointment.STATUS_APPROVED).count(),
        "completed": Appointment.objects.filter(doctor=doctor, status=Appointment.STATUS_COMPLETED).count(),
    }
    return render(
        request,
        "appointments/doctor/dashboard.html",
        {"doctor": doctor, "upcoming": upcoming, "stats": stats},
    )


@role_required(ROLE_DOCTOR)
def doctor_appointments(request):
    doctor = get_object_or_404(Doctor, user=request.user)
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "")
    appointments = Appointment.objects.filter(doctor=doctor).select_related("patient")
    if query:
        appointments = appointments.filter(
            Q(patient__name__icontains=query) | Q(symptoms__icontains=query)
        )
    if status:
        appointments = appointments.filter(status=status)
    context = {"appointments": appointments, "query": query, "status": status, "doctor": doctor}
    if is_htmx(request) and request.GET.get('partial') == 'table':
        html = render_to_string("appointments/doctor/partials/appointment_table.html", context, request=request)
        return HttpResponse(html)
    return render(request, "appointments/doctor/appointment_list.html", context)


@role_required(ROLE_DOCTOR)
def doctor_update_status(request, pk):
    doctor = get_object_or_404(Doctor, user=request.user)
    appointment = get_object_or_404(Appointment, pk=pk, doctor=doctor)
    if request.method == "POST":
        form = AppointmentStatusForm(request.POST, instance=appointment)
        if form.is_valid():
            form.save()
            messages.success(request, "Status updated.")
            if is_htmx(request):
                html = render_to_string(
                    "appointments/doctor/partials/appointment_row.html",
                    {"appointment": appointment},
                    request=request,
                )
                response = HttpResponse(html)
                response["HX-Trigger"] = json.dumps({"toast": "Status updated."})
                return response
            return redirect("doctor_panel:appointments")
    else:
        form = AppointmentStatusForm(instance=appointment)
    return render(
        request,
        "appointments/doctor/appointment_status_form.html",
        {"form": form, "appointment": appointment},
    )


# Patient views
@role_required(ROLE_PATIENT)
def patient_dashboard(request):
    patient = get_object_or_404(Patient, user=request.user)
    upcoming = (
        Appointment.objects.filter(patient=patient)
        .select_related("doctor")
        .order_by("date", "time")
    )
    recent = upcoming.filter(date__lt=date.today()).order_by('-date', '-time')[:5]
    next_appointments = upcoming.filter(date__gte=date.today())[:5]
    return render(
        request,
        "appointments/patient/dashboard.html",
        {
            "patient": patient,
            "next_appointments": next_appointments,
            "recent": recent,
        },
    )


@role_required(ROLE_PATIENT)
def patient_appointments(request):
    patient = get_object_or_404(Patient, user=request.user)
    query = request.GET.get("q", "").strip()
    status = request.GET.get("status", "")
    appointments = Appointment.objects.filter(patient=patient).select_related("doctor")
    if query:
        appointments = appointments.filter(
            Q(doctor__name__icontains=query) | Q(symptoms__icontains=query)
        )
    if status:
        appointments = appointments.filter(status=status)
    form = AppointmentForm()
    context = {"appointments": appointments, "query": query, "status": status, "patient": patient, "form": form}
    if is_htmx(request) and request.GET.get('partial') == 'table':
        html = render_to_string("appointments/patient/partials/appointment_table.html", context, request=request)
        return HttpResponse(html)
    return render(request, "appointments/patient/appointment_list.html", context)


@role_required(ROLE_PATIENT)
def patient_appointment_form(request, pk=None):
    patient = get_object_or_404(Patient, user=request.user)
    appointment = Appointment.objects.filter(pk=pk, patient=patient).first()
    if request.method == "POST":
        form = AppointmentForm(request.POST, instance=appointment)
        if form.is_valid():
            new_appointment = form.save(commit=False)
            new_appointment.patient = patient
            if not appointment:
                new_appointment.status = Appointment.STATUS_PENDING
            new_appointment.save()
            messages.success(request, "Appointment saved successfully.")
            if is_htmx(request):
                html = render_to_string(
                    "appointments/patient/partials/appointment_row.html",
                    {"appointment": new_appointment},
                    request=request,
                )
                response = HttpResponse(html)
                response["HX-Trigger"] = json.dumps({"toast": "Appointment saved successfully."})
                return response
            return redirect("patient_panel:appointments")
    else:
        form = AppointmentForm(instance=appointment)
    if is_htmx(request) and request.method == "POST":
        html = render_to_string("components/form_errors.html", {"form": form}, request=request)
        return HttpResponse(html, status=400)
    return render(
        request,
        "appointments/patient/appointment_form.html",
        {"form": form, "appointment": appointment},
    )


@role_required(ROLE_PATIENT)
def patient_appointment_delete(request, pk):
    patient = get_object_or_404(Patient, user=request.user)
    appointment = get_object_or_404(Appointment, pk=pk, patient=patient)
    appointment.delete()
    messages.success(request, "Appointment cancelled.")
    if is_htmx(request):
        response = HttpResponse("", status=204)
        response["HX-Trigger"] = json.dumps({"toast": "Appointment cancelled."})
        return response
    return redirect("patient_panel:appointments")
