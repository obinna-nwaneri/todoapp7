from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.urls import reverse

ROLE_ADMIN = "Admin"
ROLE_DOCTOR = "Doctor"
ROLE_PATIENT = "Patient"


class RoleLoginView(LoginView):
    template_name = "accounts/login.html"

    def get_success_url(self):
        return reverse("dashboard-redirect")


@login_required
def dashboard_redirect(request):
    user = request.user
    if user.is_superuser or user.groups.filter(name=ROLE_ADMIN).exists():
        return redirect("admin_panel:dashboard")
    if user.groups.filter(name=ROLE_DOCTOR).exists():
        return redirect("doctor_panel:dashboard")
    if user.groups.filter(name=ROLE_PATIENT).exists():
        return redirect("patient_panel:dashboard")
    messages.error(request, "Your account does not have an assigned role. Please contact the administrator.")
    logout(request)
    return redirect("login")
