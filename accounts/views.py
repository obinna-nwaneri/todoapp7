from __future__ import annotations

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.shortcuts import get_object_or_404, redirect, render

from core.decorators import role_required

from .forms import (
    DoctorProfileForm,
    DoctorRegistrationForm,
    LoginForm,
    PatientProfileForm,
    PatientRegistrationForm,
)
from .models import DoctorProfile, PatientProfile


patient_required = role_required(lambda u: u.is_patient())
doctor_required = role_required(lambda u: u.is_doctor())


class LoginView(DjangoLoginView):
    form_class = LoginForm
    template_name = "accounts/login.html"


def register_patient(request):
    if request.method == "POST":
        form = PatientRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, "Account created. Please log in.")
            return redirect("accounts:login")
    else:
        form = PatientRegistrationForm()
    return render(request, "accounts/register_patient.html", {"form": form})


def register_doctor(request):
    if request.method == "POST":
        form = DoctorRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.info(
                request,
                "Doctor account submitted. An administrator will review and activate your profile.",
            )
            return redirect("home")
    else:
        form = DoctorRegistrationForm()
    return render(request, "accounts/register_doctor.html", {"form": form})


@login_required
@patient_required
def patient_profile(request):
    profile = get_object_or_404(PatientProfile, user=request.user)
    if request.method == "POST":
        form = PatientProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated")
            return redirect("patient:profile")
    else:
        form = PatientProfileForm(instance=profile)
    return render(request, "patient/profile.html", {"form": form})


@login_required
@doctor_required
def doctor_profile(request):
    profile = get_object_or_404(DoctorProfile, user=request.user)
    if request.method == "POST":
        form = DoctorProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated")
            return redirect("doctor:profile")
    else:
        form = DoctorProfileForm(instance=profile)
    return render(request, "doctor/profile.html", {"form": form, "profile": profile})


