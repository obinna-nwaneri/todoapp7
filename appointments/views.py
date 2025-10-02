from datetime import date

from django.contrib import messages
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.views import LoginView
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.views.decorators.http import require_GET, require_POST

from .forms import (
    AppointmentForm,
    DoctorForm,
    PatientAuthenticationForm,
    PatientRegistrationForm,
    UserProfileForm,
)
from .models import Appointment, Doctor


def home(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect("admin_panel")
        return redirect("dashboard")
    return render(request, "appointments/home.html")


def register_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("dashboard")

    form = PatientRegistrationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, "Registration successful. Welcome!")
        return redirect("dashboard")

    return render(request, "appointments/register.html", {"form": form})


class PatientLoginView(LoginView):
    form_class = PatientAuthenticationForm
    template_name = "appointments/login.html"

    def form_valid(self, form):
        user = form.get_user()
        if user.is_staff:
            login(self.request, user)
            return redirect("admin_panel")
        return super().form_valid(form)

    def get_success_url(self):
        return "/dashboard"


def logout_view(request: HttpRequest) -> HttpResponse:
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect("home")


@login_required
def dashboard(request: HttpRequest) -> HttpResponse:
    if request.user.is_staff:
        return redirect("admin_panel")

    appointment_form = AppointmentForm()
    profile_form = UserProfileForm(instance=request.user)
    password_form = PasswordChangeForm(user=request.user)

    upcoming_appointments = (
        Appointment.objects.filter(patient=request.user, date__gte=date.today())
        .select_related("doctor")
        .order_by("date", "time")
    )
    past_appointments = (
        Appointment.objects.filter(patient=request.user, date__lt=date.today())
        .select_related("doctor")
        .order_by("-date", "-time")
    )

    return render(
        request,
        "appointments/dashboard.html",
        {
            "appointment_form": appointment_form,
            "profile_form": profile_form,
            "password_form": password_form,
            "upcoming_appointments": upcoming_appointments,
            "past_appointments": past_appointments,
        },
    )


@login_required
@require_POST
def book_appointment(request: HttpRequest) -> HttpResponse:
    if request.user.is_staff:
        return HttpResponseBadRequest("Admins cannot book appointments.")

    form = AppointmentForm(request.POST)
    if form.is_valid():
        appointment: Appointment = form.save(commit=False)
        appointment.patient = request.user
        appointment.status = Appointment.STATUS_PENDING
        appointment.save()
        messages.success(request, "Appointment requested successfully.")
        response = HttpResponse(
            render_to_string(
                "appointments/partials/booking_form.html",
                {"form": AppointmentForm()},
                request=request,
            )
        )
        response["HX-Trigger"] = "appointmentListChanged"
        return response

    return HttpResponse(
        render_to_string(
            "appointments/partials/booking_form.html",
            {"form": form},
            request=request,
        ),
        status=400,
    )


@login_required
@require_GET
def appointment_list_partial(request: HttpRequest) -> HttpResponse:
    appointments = (
        Appointment.objects.filter(patient=request.user, date__gte=date.today())
        .select_related("doctor")
        .order_by("date", "time")
    )
    return HttpResponse(
        render_to_string(
            "appointments/partials/appointment_list.html",
            {"appointments": appointments},
            request=request,
        )
    )


@login_required
@require_POST
def update_profile(request: HttpRequest) -> HttpResponse:
    if request.user.is_staff:
        return redirect("admin_panel")

    form_type = request.POST.get("form_type")
    if form_type == "profile":
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
        else:
            messages.error(request, "Please correct the errors in your profile form.")
    elif form_type == "password":
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            messages.success(request, "Password updated successfully.")
        else:
            messages.error(request, "Please correct the errors in your password form.")
    else:
        messages.error(request, "Invalid form submission.")

    return redirect("dashboard")


def admin_panel(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated or not request.user.is_staff:
        form = PatientAuthenticationForm(request=request, data=request.POST or None)
        if request.method == "POST" and form.is_valid():
            user = form.get_user()
            if user.is_staff:
                login(request, user)
                return redirect("admin_panel")
            form.add_error(None, "You do not have admin access.")
        return render(request, "appointments/admin_login.html", {"form": form})

    patient_users = User.objects.filter(is_staff=False).order_by("username")
    appointments = Appointment.objects.select_related("doctor", "patient").order_by(
        "status", "-date", "-time"
    )
    doctors = Doctor.objects.all()
    doctor_form = DoctorForm()

    return render(
        request,
        "appointments/admin_dashboard.html",
        {
            "patients": patient_users,
            "appointments": appointments,
            "doctors": doctors,
            "doctor_form": doctor_form,
        },
    )


def staff_required(view_func):
    decorated_view = login_required(
        user_passes_test(lambda u: u.is_staff, login_url="admin_panel")(view_func),
        login_url="admin_panel",
    )
    return decorated_view


@staff_required
@require_POST
def update_appointment_status(request: HttpRequest, pk: int) -> HttpResponse:
    appointment = get_object_or_404(Appointment, pk=pk)
    status_value = request.POST.get("status")
    if status_value not in dict(Appointment.STATUS_CHOICES):
        return HttpResponseBadRequest("Invalid status")
    appointment.status = status_value
    appointment.save(update_fields=["status"])
    response = HttpResponse(
        render_to_string(
            "appointments/partials/admin_appointment_row.html",
            {"appointment": appointment},
            request=request,
        )
    )
    response["HX-Trigger"] = "appointmentListChanged"
    return response


@staff_required
@require_GET
def admin_appointment_rows(request: HttpRequest) -> HttpResponse:
    appointments = Appointment.objects.select_related("doctor", "patient").order_by("status", "-date", "-time")
    return HttpResponse(
        render_to_string(
            "appointments/partials/admin_appointment_rows.html",
            {"appointments": appointments},
            request=request,
        )
    )


@staff_required
@require_GET
def doctor_form_partial(request: HttpRequest, pk: int | None = None) -> HttpResponse:
    doctor = get_object_or_404(Doctor, pk=pk) if pk else None
    form = DoctorForm(instance=doctor)
    return HttpResponse(
        render_to_string(
            "appointments/partials/doctor_form.html",
            {"form": form, "doctor": doctor},
            request=request,
        )
    )


@staff_required
@require_POST
def save_doctor(request: HttpRequest, pk: int | None = None) -> HttpResponse:
    doctor = get_object_or_404(Doctor, pk=pk) if pk else None
    form = DoctorForm(request.POST, instance=doctor)
    if form.is_valid():
        doctor = form.save()
        doctors = Doctor.objects.all()
        response = HttpResponse(
            render_to_string(
                "appointments/partials/doctor_list.html",
                {"doctors": doctors},
                request=request,
            )
        )
        response["HX-Trigger"] = "doctorListChanged"
        return response
    return HttpResponse(
        render_to_string(
            "appointments/partials/doctor_form.html",
            {"form": form, "doctor": doctor},
            request=request,
        ),
        status=400,
    )


@staff_required
@require_POST
def delete_doctor(request: HttpRequest, pk: int) -> HttpResponse:
    doctor = get_object_or_404(Doctor, pk=pk)
    doctor.delete()
    doctors = Doctor.objects.all()
    response = HttpResponse(
        render_to_string(
            "appointments/partials/doctor_list.html",
            {"doctors": doctors},
            request=request,
        )
    )
    response["HX-Trigger"] = "doctorListChanged"
    return response
