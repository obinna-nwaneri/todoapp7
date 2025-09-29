from __future__ import annotations

from django.contrib import messages
from django.contrib.auth import get_user_model, login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import PasswordChangeView
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.decorators.http import require_http_methods
from django.views.generic import FormView

from audit.models import ActivityLog
from tasks.models import Task

from .forms import RegistrationForm, TaskAdminForm, UserAdminForm

User = get_user_model()


def _log_activity(user, action: str, entity: str, entity_id: int | None = None, meta: dict | None = None):
    ActivityLog.objects.create(
        user=user,
        action=action,
        entity=entity,
        entity_id=entity_id,
        meta=meta or {},
    )


class RegisterView(FormView):
    template_name = "accounts/register.html"
    form_class = RegistrationForm
    success_url = reverse_lazy("tasks:dashboard")

    def form_valid(self, form):
        user = form.save(commit=False)
        user.email = form.cleaned_data.get("email")
        user.is_staff = False
        user.save()
        login(self.request, user)
        messages.success(self.request, "Registration successful. Welcome!")
        _log_activity(user, "user_create", "User", user.pk, {"username": user.username})
        return redirect(self.get_success_url())


class ChangePasswordView(LoginRequiredMixin, PasswordChangeView):
    template_name = "accounts/change_password.html"
    success_url = reverse_lazy("tasks:dashboard")

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Password updated successfully.")
        _log_activity(self.request.user, "user_update", "User", self.request.user.pk, {"password_change": True})
        return response


def _staff_check(user):
    return user.is_staff


def staff_required(view_func):
    decorated = login_required(user_passes_test(_staff_check)(view_func))
    return decorated


@staff_required
def admin_dashboard(request: HttpRequest) -> HttpResponse:
    return render(request, "admin_panel/dashboard.html")


@staff_required
def admin_metrics_partial(request: HttpRequest) -> HttpResponse:
    user_count = User.objects.count()
    task_count = Task.objects.count()
    pending = Task.objects.filter(status="pending").count()
    in_progress = Task.objects.filter(status="in_progress").count()
    completed = Task.objects.filter(status="completed").count()

    context = {
        "user_count": user_count,
        "task_count": task_count,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
    }
    return render(request, "admin_panel/_metrics.html", context)


@staff_required
def admin_activity_partial(request: HttpRequest) -> HttpResponse:
    logs = ActivityLog.objects.select_related("user")
    action = request.GET.get("action") or ""
    user_filter = request.GET.get("user") or ""
    query = request.GET.get("q") or ""

    if action:
        logs = logs.filter(action=action)
    if user_filter:
        logs = logs.filter(user_id=user_filter)
    if query:
        logs = logs.filter(
            Q(entity__icontains=query)
            | Q(meta__icontains=query)
            | Q(user__username__icontains=query)
        )

    paginator = Paginator(logs, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    context = {
        "page_obj": page_obj,
        "actions": ActivityLog.ACTION_CHOICES,
        "users": User.objects.all(),
        "current_action": action,
        "current_user": user_filter,
        "query": query,
    }
    return render(request, "admin_panel/_activity_table.html", context)


@staff_required
def users_list(request: HttpRequest) -> HttpResponse:
    search = request.GET.get("q") or ""
    users = User.objects.all().order_by("username")
    if search:
        users = users.filter(Q(username__icontains=search) | Q(email__icontains=search))

    paginator = Paginator(users, 10)
    page_obj = paginator.get_page(request.GET.get("page"))
    context = {
        "page_obj": page_obj,
        "search": search,
    }
    return render(request, "admin_panel/users_list.html", context)


@staff_required
@require_http_methods(["GET", "POST"])
def users_add(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        form = UserAdminForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, "User created successfully.")
            _log_activity(request.user, "user_create", "User", user.pk, {"username": user.username})
            return redirect("admin_users")
    else:
        form = UserAdminForm()
    return render(request, "admin_panel/users_form.html", {"form": form, "title": "Add User"})


@staff_required
@require_http_methods(["GET", "POST"])
def users_edit(request: HttpRequest, pk: int) -> HttpResponse:
    user_obj = get_object_or_404(User, pk=pk)
    form = UserAdminForm(request.POST or None, instance=user_obj)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        messages.success(request, "User updated successfully.")
        _log_activity(request.user, "user_update", "User", user.pk, {"username": user.username})
        return redirect("admin_users")
    return render(request, "admin_panel/users_form.html", {"form": form, "title": "Edit User", "user_obj": user_obj})


@staff_required
@require_http_methods(["POST"])
def users_delete(request: HttpRequest, pk: int) -> HttpResponse:
    if request.user.pk == pk:
        messages.error(request, "You cannot delete your own account.")
        return redirect("admin_users")
    user_obj = get_object_or_404(User, pk=pk)
    _log_activity(request.user, "user_delete", "User", user_obj.pk, {"username": user_obj.username})
    user_obj.delete()
    messages.success(request, "User deleted successfully.")
    return redirect("admin_users")


@staff_required
def tasks_list_admin(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        task_id = request.POST.get("task_id")
        action = request.POST.get("action", "update")
        task = get_object_or_404(Task, pk=task_id)
        if action == "delete":
            _log_activity(
                request.user,
                "task_delete",
                "Task",
                task.pk,
                {"title": task.title, "owner": task.owner.username},
            )
            task.delete()
            messages.success(request, "Task deleted.")
            return redirect("admin_tasks")
        form = TaskAdminForm(request.POST, instance=task)
        if form.is_valid():
            updated_task = form.save()
            _log_activity(
                request.user,
                "task_update",
                "Task",
                updated_task.pk,
                {
                    "title": updated_task.title,
                    "status": updated_task.status,
                    "owner": updated_task.owner.username,
                },
            )
            messages.success(request, "Task updated.")
            return redirect("admin_tasks")
        messages.error(request, "Please correct the errors below.")
    else:
        form = None

    tasks = Task.objects.select_related("owner").all()
    owner = request.GET.get("owner") or ""
    status = request.GET.get("status") or ""
    priority = request.GET.get("priority") or ""
    query = request.GET.get("q") or ""

    if owner:
        tasks = tasks.filter(owner_id=owner)
    if status:
        tasks = tasks.filter(status=status)
    if priority:
        tasks = tasks.filter(priority=priority)
    if query:
        tasks = tasks.filter(Q(title__icontains=query) | Q(description__icontains=query))

    paginator = Paginator(tasks, 15)
    page_obj = paginator.get_page(request.GET.get("page"))

    context = {
        "page_obj": page_obj,
        "owners": User.objects.all(),
        "current_owner": owner,
        "current_status": status,
        "current_priority": priority,
        "query": query,
        "task_form": form,
    }
    return render(request, "admin_panel/tasks_list.html", context)
