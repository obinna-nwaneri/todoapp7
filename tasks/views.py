from __future__ import annotations

import json
from datetime import timedelta

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import login
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import (
    LoginView,
    LogoutView,
    PasswordChangeDoneView,
    PasswordChangeView,
)
from django.db.models import Count, Q
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.views import View
from django.views.generic import CreateView, DeleteView, DetailView, ListView, TemplateView, UpdateView
from django.core.paginator import Paginator

from django.contrib.auth import get_user_model

from .forms import (
    StyledAuthenticationForm,
    StyledPasswordChangeForm,
    StyledUserCreationForm,
    TaskForm,
)
from .models import ActivityLog, Task
from .utils import log_activity

User = get_user_model()


class HomeView(TemplateView):
    template_name = "home.html"


class SignUpView(CreateView):
    form_class = StyledUserCreationForm
    template_name = "registration/signup.html"
    success_url = reverse_lazy("tasks:list")

    def form_valid(self, form: UserCreationForm) -> HttpResponse:
        super().form_valid(form)
        user = self.object
        login(self.request, user)
        messages.success(self.request, "Welcome aboard! Your account is ready.")
        log_activity(user, ActivityLog.ACTION_LOGIN, extra={"source": "signup"})
        return redirect(self.get_success_url())


class CustomLoginView(LoginView):
    template_name = "registration/login.html"
    authentication_form = StyledAuthenticationForm

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Signed in successfully.")
        log_activity(self.request.user, ActivityLog.ACTION_LOGIN)
        return response


class CustomLogoutView(LogoutView):
    next_page = reverse_lazy("home")
    http_method_names = ["get", "post", "head", "options"]

    def get(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        return self.post(request, *args, **kwargs)

    def dispatch(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        user = request.user if request.user.is_authenticated else None
        response = super().dispatch(request, *args, **kwargs)
        if user:
            log_activity(user, ActivityLog.ACTION_LOGOUT)
            messages.info(request, "You have been logged out.")
        return response


class CustomPasswordChangeView(PasswordChangeView):
    form_class = StyledPasswordChangeForm
    template_name = "registration/password_change_form.html"
    success_url = reverse_lazy("accounts:password_change_done")

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Password updated successfully.")
        log_activity(self.request.user, ActivityLog.ACTION_PASSWORD_CHANGE)
        return response


class CustomPasswordChangeDoneView(PasswordChangeDoneView):
    template_name = "registration/password_change_done.html"


class OwnerQuerySetMixin(LoginRequiredMixin):
    model = Task

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)


class TaskListView(OwnerQuerySetMixin, ListView):
    template_name = "tasks/task_list.html"
    context_object_name = "tasks"
    paginate_by = 20

    def get_queryset(self):
        queryset = super().get_queryset()
        request = self.request
        q = request.GET.get("q", "").strip()
        status = request.GET.get("status", "")
        priority = request.GET.get("priority", "")
        due_filter = request.GET.get("due", "all")
        sort_field = request.GET.get("sort", "created_at")
        direction = request.GET.get("direction", "desc")

        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(description__icontains=q))
        if status in dict(Task.STATUS_CHOICES):
            queryset = queryset.filter(status=status)
        if priority in dict(Task.PRIORITY_CHOICES):
            queryset = queryset.filter(priority=priority)

        today = timezone.localdate()
        if due_filter == "today":
            queryset = queryset.filter(due_date=today)
        elif due_filter == "week":
            queryset = queryset.filter(due_date__range=(today, today + timedelta(days=7)))
        elif due_filter == "overdue":
            queryset = queryset.filter(due_date__lt=today)

        sort_map = {
            "due_date": "due_date",
            "priority": "priority",
            "status": "status",
            "created_at": "created_at",
        }
        order_field = sort_map.get(sort_field, "created_at")
        if direction == "desc":
            order_field = f"-{order_field}" if not order_field.startswith("-") else order_field
        queryset = queryset.order_by(order_field, "-created_at")

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(
            {
                "form": TaskForm(),
                "task": Task,
                "filters": {
                    "q": self.request.GET.get("q", ""),
                    "status": self.request.GET.get("status", ""),
                    "priority": self.request.GET.get("priority", ""),
                    "due": self.request.GET.get("due", "all"),
                    "sort": self.request.GET.get("sort", "created_at"),
                    "direction": self.request.GET.get("direction", "desc"),
                },
                "is_hx": self.request.headers.get("HX-Request") is not None,
            }
        )
        query_params = self.request.GET.copy()
        query_params.pop("page", None)
        context["query_string"] = query_params.urlencode()
        return context


class TaskCreateView(OwnerQuerySetMixin, CreateView):
    form_class = TaskForm
    template_name = "tasks/task_form.html"
    success_url = reverse_lazy("tasks:list")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["task"] = None
        return context

    def form_valid(self, form):
        form.instance.user = self.request.user
        response = super().form_valid(form)
        log_activity(self.request.user, ActivityLog.ACTION_CREATED, self.object)
        message_text = "Task created successfully."
        messages.success(self.request, message_text)
        if self.request.headers.get("HX-Request"):
            context = {"task": self.object}
            hx_response = render(self.request, "tasks/_task_row.html", context)
            hx_response["HX-Trigger"] = json.dumps(
                {"tasksChanged": True, "showMessage": message_text}
            )
            return hx_response
        return response

    def form_invalid(self, form):
        template = "tasks/_task_form.html" if self.request.headers.get("HX-Request") else self.template_name
        response = render(self.request, template, {"form": form})
        if self.request.headers.get("HX-Request"):
            response.status_code = 400
        return response


class TaskDetailView(OwnerQuerySetMixin, DetailView):
    template_name = "tasks/task_detail.html"
    context_object_name = "task"

    def get_template_names(self):
        if self.request.headers.get("HX-Request"):
            return ["tasks/_task_row.html"]
        return super().get_template_names()


class TaskUpdateView(OwnerQuerySetMixin, UpdateView):
    form_class = TaskForm
    template_name = "tasks/task_form.html"
    success_url = reverse_lazy("tasks:list")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["task"] = self.object
        return context

    def get_template_names(self):
        if self.request.headers.get("HX-Request"):
            return ["tasks/_task_form.html"]
        return super().get_template_names()

    def form_valid(self, form):
        response = super().form_valid(form)
        log_activity(self.request.user, ActivityLog.ACTION_UPDATED, self.object)
        message_text = "Task updated successfully."
        messages.success(self.request, message_text)
        if self.request.headers.get("HX-Request"):
            hx_response = render(self.request, "tasks/_task_row.html", {"task": self.object})
            hx_response["HX-Trigger"] = json.dumps(
                {"tasksChanged": True, "showMessage": message_text}
            )
            return hx_response
        return response

    def form_invalid(self, form):
        template = "tasks/_task_form.html" if self.request.headers.get("HX-Request") else self.template_name
        response = render(self.request, template, {"form": form, "task": self.object})
        if self.request.headers.get("HX-Request"):
            response.status_code = 400
        return response


class TaskDeleteView(OwnerQuerySetMixin, DeleteView):
    template_name = "tasks/task_confirm_delete.html"
    success_url = reverse_lazy("tasks:list")

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        template = (
            "tasks/_task_confirm_delete.html"
            if request.headers.get("HX-Request")
            else self.template_name
        )
        return render(request, template, {"task": self.object})

    def form_valid(self, form):
        task = self.get_object()
        log_activity(self.request.user, ActivityLog.ACTION_DELETED, task)
        message_text = "Task deleted."
        messages.success(self.request, message_text)
        response = super().form_valid(form)
        if self.request.headers.get("HX-Request"):
            hx_response = HttpResponse("", status=200)
            hx_response["HX-Trigger"] = json.dumps(
                {"tasksChanged": True, "showMessage": message_text}
            )
            return hx_response
        return response


class TaskToggleStatusView(OwnerQuerySetMixin, View):
    def post(self, request, *args, **kwargs):
        task = get_object_or_404(self.get_queryset(), pk=kwargs.get("pk"))
        order = [Task.STATUS_PENDING, Task.STATUS_IN_PROGRESS, Task.STATUS_COMPLETED]
        next_index = (order.index(task.status) + 1) % len(order)
        task.status = order[next_index]
        task.save(update_fields=["status", "updated_at"])
        log_activity(request.user, ActivityLog.ACTION_UPDATED, task, extra={"toggle": True})
        if request.headers.get("HX-Request"):
            hx_response = render(request, "tasks/_task_row.html", {"task": task})
            hx_response["HX-Trigger"] = json.dumps(
                {"tasksChanged": True, "showMessage": "Task status updated."}
            )
            return hx_response
        messages.success(request, "Task status updated.")
        return redirect("tasks:list")


@staff_member_required
def admin_dashboard(request: HttpRequest) -> HttpResponse:
    context = {
        "kpi_url": reverse("admin-dashboard-kpis"),
        "recent_url": reverse("admin-dashboard-recent"),
        "users_url": reverse("admin-dashboard-users"),
    }
    return render(request, "admin_dashboard/dashboard.html", context)


@staff_member_required
def admin_dashboard_kpis(request: HttpRequest) -> HttpResponse:
    context = _build_kpi_context()
    template = "admin_dashboard/_kpis.html"
    return render(request, template, context)


@staff_member_required
def admin_dashboard_recent(request: HttpRequest) -> HttpResponse:
    logs = ActivityLog.objects.select_related("actor", "task")[:15]
    return render(request, "admin_dashboard/_recent.html", {"logs": logs})


@staff_member_required
def admin_dashboard_users(request: HttpRequest) -> HttpResponse:
    user_qs = (
        User.objects.annotate(
            total_tasks=Count("tasks"),
            pending_tasks=Count("tasks", filter=Q(tasks__status=Task.STATUS_PENDING)),
            in_progress_tasks=Count("tasks", filter=Q(tasks__status=Task.STATUS_IN_PROGRESS)),
            completed_tasks=Count("tasks", filter=Q(tasks__status=Task.STATUS_COMPLETED)),
        )
        .order_by("username")
    )
    paginator = Paginator(user_qs, 10)
    page_number = request.GET.get("page")
    users_page = paginator.get_page(page_number)
    return render(request, "admin_dashboard/_users_table.html", {"users": users_page})


def _build_kpi_context() -> dict:
    total_users = User.objects.count()
    total_tasks = Task.objects.count()
    status_counts = Task.objects.values("status").annotate(total=Count("id"))
    priority_counts = Task.objects.values("priority").annotate(total=Count("id"))
    status_map = {key: 0 for key, _ in Task.STATUS_CHOICES}
    for row in status_counts:
        status_map[row["status"]] = row["total"]
    priority_map = {key: 0 for key, _ in Task.PRIORITY_CHOICES}
    for row in priority_counts:
        priority_map[row["priority"]] = row["total"]
    return {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "status_stats": [
            {"key": key, "label": label, "count": status_map[key]}
            for key, label in Task.STATUS_CHOICES
        ],
        "priority_stats": [
            {"key": key, "label": label, "count": priority_map[key]}
            for key, label in Task.PRIORITY_CHOICES
        ],
        "task": Task,
    }
