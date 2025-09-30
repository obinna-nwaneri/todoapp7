from __future__ import annotations

from datetime import date

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.views import LoginView, PasswordChangeDoneView, PasswordChangeView
from django.db.models import Count, Q
from django.http import Http404, HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import DetailView, FormView, ListView, TemplateView

from .forms import (
    AppointmentRequestForm,
    AppointmentRescheduleForm,
    AvailabilityFormSet,
    TailwindAuthenticationForm,
    TailwindPasswordChangeForm,
    UserRegistrationForm,
)

from .models import Appointment, DoctorProfile, PatientProfile, Specialty, WeeklyAvailability
from .services import (
    generate_slots_for_doctor,
    log_activity,
    notify_approval,
    notify_booking,
    notify_cancel,
    notify_decline,
    notify_reschedule,
)


class HomeView(TemplateView):
    template_name = "home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["specialties"] = Specialty.objects.all()
        context["featured_doctors"] = (
            DoctorProfile.objects.filter(is_active=True)
            .select_related("user", "specialty", "clinic")
            .order_by("user__first_name")[:6]
        )
        return context


class CustomLoginView(LoginView):
    template_name = "registration/login.html"
    form_class = TailwindAuthenticationForm


class RegisterView(FormView):
    form_class = UserRegistrationForm
    template_name = "registration/signup.html"
    success_url = reverse_lazy("home")

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        messages.success(self.request, "Welcome to MedBook!")
        log_activity(user, "user_register", user)
        return super().form_valid(form)


class DoctorRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return hasattr(self.request.user, "doctor_profile")

    def handle_no_permission(self):
        if self.request.user.is_authenticated:
            raise Http404
        return super().handle_no_permission()


class StaffRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_staff


class DoctorListView(ListView):
    template_name = "doctor_directory.html"
    context_object_name = "doctors"
    paginate_by = 12

    def get_queryset(self):
        qs = (
            DoctorProfile.objects.filter(is_active=True)
            .select_related("user", "specialty", "clinic")
            .prefetch_related("availabilities")
        )
        q = self.request.GET.get("q")
        if q:
            qs = qs.filter(
                Q(user__first_name__icontains=q)
                | Q(user__last_name__icontains=q)
                | Q(user__username__icontains=q)
                | Q(specialty__name__icontains=q)
                | Q(clinic__city__icontains=q)
                | Q(clinic__state__icontains=q)
            )
        specialty_slug = self.request.GET.get("specialty")
        if specialty_slug:
            qs = qs.filter(specialty__slug=specialty_slug)
        location = self.request.GET.get("location")
        if location:
            qs = qs.filter(
                Q(clinic__city__icontains=location)
                | Q(clinic__state__icontains=location)
                | Q(clinic__address__icontains=location)
            )
        weekday = self.request.GET.get("weekday")
        if weekday not in (None, ""):
            try:
                weekday = int(weekday)
                qs = qs.filter(availabilities__weekday=weekday)
            except ValueError:
                pass
        next_available = self.request.GET.get("next_available")
        if next_available:
            ids = []
            for doctor in qs:
                slots = generate_slots_for_doctor(doctor.user, timezone.localdate(), weeks=2)
                if slots:
                    ids.append(doctor.id)
            qs = qs.filter(id__in=ids)
        return qs.distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["specialties"] = Specialty.objects.all()
        context["weekdays"] = WeeklyAvailability.WEEKDAYS
        return context


class DoctorDetailView(DetailView):
    template_name = "doctor_detail.html"
    context_object_name = "doctor"

    def get_object(self, queryset=None):
        return get_object_or_404(
            DoctorProfile.objects.select_related("user", "specialty", "clinic"),
            user__username=self.kwargs["username"],
            is_active=True,
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        slots = generate_slots_for_doctor(self.object.user, timezone.localdate(), weeks=4)
        context["upcoming_slots"] = slots[:10]
        return context


class PatientAppointmentListView(LoginRequiredMixin, ListView):
    template_name = "appointments/my_list.html"
    context_object_name = "appointments"
    paginate_by = 10

    def get_queryset(self):
        qs = (
            Appointment.objects.filter(patient=self.request.user)
            .select_related("doctor__doctor_profile__specialty", "doctor__doctor_profile__clinic")
            .order_by("-start")
        )
        status = self.request.GET.get("status")
        if status:
            qs = qs.filter(status=status)
        date_from = self.request.GET.get("date_from")
        date_to = self.request.GET.get("date_to")
        if date_from:
            qs = qs.filter(start__date__gte=date_from)
        if date_to:
            qs = qs.filter(start__date__lte=date_to)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["status_choices"] = Appointment.STATUS_CHOICES
        return context

    def render_to_response(self, context, **response_kwargs):
        if self.request.headers.get("HX-Request"):
            html = render_to_string("appointments/_rows.html", context, request=self.request)
            return HttpResponse(html)
        return super().render_to_response(context, **response_kwargs)


class AppointmentDetailView(LoginRequiredMixin, DetailView):
    template_name = "appointments/detail.html"
    context_object_name = "appointment"

    def get_queryset(self):
        return Appointment.objects.select_related("patient", "doctor", "doctor__doctor_profile")

    def get_object(self, queryset=None):
        appointment = super().get_object(queryset)
        if appointment.patient != self.request.user and appointment.doctor != self.request.user:
            raise Http404
        return appointment


class AppointmentCreateView(LoginRequiredMixin, FormView):
    template_name = "appointments/book.html"
    form_class = AppointmentRequestForm

    def get_initial(self):
        initial = super().get_initial()
        doctor = self.request.GET.get("doctor")
        date_value = self.request.GET.get("date")
        if doctor:
            initial["doctor"] = doctor
        if date_value:
            initial["date"] = date_value
        return initial

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["patient"] = self.request.user
        kwargs["request"] = self.request
        if self.request.method == "GET" and (self.request.GET.get("doctor") or self.request.GET.get("date")):
            kwargs["data"] = self.request.GET
        return kwargs

    def get(self, request, *args, **kwargs):
        form = self.get_form()
        if request.headers.get("HX-Request"):
            return render(request, "appointments/_slot_select.html", {"form": form})
        return self.render_to_response(self.get_context_data(form=form))

    def form_valid(self, form):
        appointment = form.save()
        notify_booking(appointment)
        log_activity(self.request.user, "appointment_create", appointment)
        messages.success(self.request, "Appointment request submitted.")
        return redirect("appointment_detail", pk=appointment.pk)


class CustomPasswordChangeView(LoginRequiredMixin, PasswordChangeView):
    template_name = "registration/password_change_form.html"
    success_url = reverse_lazy("password_change_done")
    form_class = TailwindPasswordChangeForm

    def form_valid(self, form):
        response = super().form_valid(form)
        log_activity(self.request.user, "password_change", self.request.user)
        return response


class CustomPasswordChangeDoneView(LoginRequiredMixin, PasswordChangeDoneView):
    template_name = "registration/password_change_done.html"


class DoctorAvailabilityView(LoginRequiredMixin, DoctorRequiredMixin, View):
    template_name = "doctor/availability.html"

    def get(self, request):
        doctor_profile = request.user.doctor_profile
        formset = AvailabilityFormSet(instance=doctor_profile)
        return render(request, self.template_name, {"formset": formset})

    def post(self, request):
        doctor_profile = request.user.doctor_profile
        formset = AvailabilityFormSet(request.POST, instance=doctor_profile)
        if formset.is_valid():
            formset.save()
            messages.success(request, "Availability updated.")
            log_activity(request.user, "availability_update", doctor_profile)
            return redirect("doctor_availability")
        return render(request, self.template_name, {"formset": formset})


class DoctorAppointmentListView(LoginRequiredMixin, DoctorRequiredMixin, ListView):
    template_name = "doctor/appointments.html"
    context_object_name = "appointments"
    paginate_by = 10

    def get_queryset(self):
        qs = (
            Appointment.objects.filter(doctor=self.request.user)
            .select_related("patient", "doctor")
            .order_by("start")
        )
        status = self.request.GET.get("status")
        if status:
            qs = qs.filter(status=status)
        date_from = self.request.GET.get("date_from")
        date_to = self.request.GET.get("date_to")
        if date_from:
            qs = qs.filter(start__date__gte=date_from)
        if date_to:
            qs = qs.filter(start__date__lte=date_to)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["status_choices"] = Appointment.STATUS_CHOICES
        return context

    def render_to_response(self, context, **response_kwargs):
        if self.request.headers.get("HX-Request"):
            html = render_to_string("doctor/_appt_rows.html", context, request=self.request)
            return HttpResponse(html)
        return super().render_to_response(context, **response_kwargs)


@login_required
def appointment_reschedule(request, pk: int):
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.user not in (appointment.patient, appointment.doctor):
        raise Http404
    if request.method == "POST":
        form = AppointmentRescheduleForm(request.POST, appointment=appointment)
        if form.is_valid():
            form.save()
            notify_reschedule(appointment)
            log_activity(request.user, "appointment_reschedule", appointment)
            messages.success(request, "Appointment rescheduled.")
            template = "doctor/_appt_row.html" if request.user == appointment.doctor else "appointments/_row.html"
            context = {"appointment": appointment}
            if request.headers.get("HX-Request"):
                return render(request, template, context)
            return redirect("appointment_detail", pk=appointment.pk)
    else:
        form = AppointmentRescheduleForm(appointment=appointment)
    if request.headers.get("HX-Request"):
        return render(
            request,
            "appointments/_modal_reschedule.html",
            {"form": form, "appointment": appointment},
        )
    return render(request, "appointments/reschedule.html", {"form": form, "appointment": appointment})


@login_required
def appointment_cancel(request, pk: int):
    if request.method != 'POST':
        return HttpResponseForbidden()
    appointment = get_object_or_404(Appointment, pk=pk)
    if request.user not in (appointment.patient, appointment.doctor):
        raise Http404
    appointment.status = Appointment.STATUS_CANCELLED
    appointment.save()
    notify_cancel(appointment)
    log_activity(request.user, "appointment_cancel", appointment)
    messages.success(request, "Appointment cancelled.")
    template = "doctor/_appt_row.html" if request.user == appointment.doctor else "appointments/_row.html"
    context = {"appointment": appointment}
    if request.headers.get("HX-Request"):
        return render(request, template, context)
    return redirect("my_appointments")


@login_required
def appointment_approve(request, pk: int):
    if request.method != 'POST':
        return HttpResponseForbidden()
    appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user)
    appointment.status = Appointment.STATUS_APPROVED
    appointment.save()
    notify_approval(appointment)
    log_activity(request.user, "appointment_approve", appointment)
    messages.success(request, "Appointment approved.")
    if request.headers.get("HX-Request"):
        return render(request, "doctor/_appt_row.html", {"appointment": appointment})
    return redirect("doctor_appointments")


@login_required
def appointment_decline(request, pk: int):
    if request.method != 'POST':
        return HttpResponseForbidden()
    appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user)
    appointment.status = Appointment.STATUS_CANCELLED
    appointment.save()
    notify_decline(appointment)
    log_activity(request.user, "appointment_decline", appointment)
    messages.info(request, "Appointment declined.")
    if request.headers.get("HX-Request"):
        return render(request, "doctor/_appt_row.html", {"appointment": appointment})
    return redirect("doctor_appointments")


@login_required
def appointment_complete(request, pk: int):
    if request.method != 'POST':
        return HttpResponseForbidden()
    appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user)
    appointment.status = Appointment.STATUS_COMPLETED
    appointment.save()
    log_activity(request.user, "appointment_complete", appointment)
    messages.success(request, "Appointment marked as completed.")
    if request.headers.get("HX-Request"):
        return render(request, "doctor/_appt_row.html", {"appointment": appointment})
    return redirect("doctor_appointments")


@login_required
def appointment_notes(request, pk: int):
    appointment = get_object_or_404(Appointment, pk=pk, doctor=request.user)
    if request.method != "POST":
        raise Http404
    appointment.notes = request.POST.get("notes", "")
    appointment.save(update_fields=["notes"])
    log_activity(request.user, "appointment_notes", appointment, {"notes": appointment.notes})
    messages.success(request, "Notes updated.")
    if request.headers.get("HX-Request"):
        return render(request, "doctor/_appt_row.html", {"appointment": appointment})
    return redirect("doctor_appointments")


class AdminDashboardView(StaffRequiredMixin, TemplateView):
    template_name = "admin_dashboard/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(get_dashboard_context())
        return context


def get_dashboard_context():
    today = timezone.localdate()
    kpis = {
        "total_doctors": DoctorProfile.objects.filter(is_active=True).count(),
        "total_patients": PatientProfile.objects.count(),
        "total_appointments": Appointment.objects.count(),
        "status_breakdown": Appointment.objects.values("status").annotate(total=Count("id")),
        "specialty_breakdown": Appointment.objects.values("doctor__doctor_profile__specialty__name").annotate(total=Count("id")),
    }
    today_schedule = Appointment.objects.filter(start__date=today).select_related("patient", "doctor").order_by("start")
    recent_activity = PatientProfile.objects.none()
    from .models import ActivityLog

    recent_activity = ActivityLog.objects.select_related("actor")[:20]
    return {
        "kpis": kpis,
        "today_schedule": today_schedule,
        "recent_activity": recent_activity,
    }


@staff_member_required
def dashboard_kpis(request):
    context = {"kpis": get_dashboard_context()["kpis"]}
    return render(request, "admin_dashboard/_kpis.html", context)


@staff_member_required
def dashboard_today(request):
    context = {"today_schedule": get_dashboard_context()["today_schedule"]}
    return render(request, "admin_dashboard/_today.html", context)


@staff_member_required
def dashboard_activity(request):
    context = {"recent_activity": get_dashboard_context()["recent_activity"]}
    return render(request, "admin_dashboard/_activity.html", context)
