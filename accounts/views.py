from __future__ import annotations

from datetime import date

from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.auth.views import PasswordChangeView
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.generic import FormView

from tasks.models import Task

from .forms import RegistrationForm, StaffUserForm


def staff_required(view_func):
    return login_required(user_passes_test(lambda u: u.is_staff)(view_func))


class RegisterView(FormView):
    template_name = "accounts/register.html"
    form_class = RegistrationForm
    success_url = reverse_lazy("accounts:login")

    def form_valid(self, form: RegistrationForm) -> HttpResponse:
        user = form.save(commit=False)
        user.is_staff = False
        user.save()
        messages.success(self.request, "Registration successful. You can now log in.")
        return super().form_valid(form)


class ChangePasswordView(LoginRequiredMixin, PasswordChangeView):
    template_name = "accounts/change_password.html"
    success_url = reverse_lazy("tasks:dashboard")

    def form_valid(self, form: PasswordChangeForm) -> HttpResponse:
        messages.success(self.request, "Password updated successfully.")
        return super().form_valid(form)


@staff_required
def admin_dashboard(request: HttpRequest) -> HttpResponse:
    total_users = User.objects.count()
    total_tasks = Task.objects.count()
    status_counts = {
        "pending": Task.objects.filter(status="pending").count(),
        "in_progress": Task.objects.filter(status="in_progress").count(),
        "completed": Task.objects.filter(status="completed").count(),
    }
    context = {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "status_counts": status_counts,
    }
    return render(request, "admin_panel/dashboard.html", context)


@staff_required
def users_list(request: HttpRequest) -> HttpResponse:
    query = request.GET.get("q", "").strip()
    users = User.objects.all().order_by("username")
    if query:
        users = users.filter(username__icontains=query)
    context = {
        "users": users,
        "query": query,
    }
    return render(request, "admin_panel/users_list.html", context)


@staff_required
def users_add(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        form = StaffUserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "User created successfully.")
            return redirect("admin_panel:admin_users")
    else:
        form = StaffUserForm(initial={"role": "user"})
    return render(request, "admin_panel/users_form.html", {"form": form, "is_edit": False})


@staff_required
def users_edit(request: HttpRequest, pk: int) -> HttpResponse:
    user = get_object_or_404(User, pk=pk)
    if request.method == "POST":
        form = StaffUserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, "User updated successfully.")
            return redirect("admin_panel:admin_users")
    else:
        form = StaffUserForm(
            instance=user,
            initial={"role": "admin" if user.is_staff else "user"},
        )
    return render(
        request,
        "admin_panel/users_form.html",
        {"form": form, "is_edit": True, "edited_user": user},
    )


@staff_required
def users_delete(request: HttpRequest, pk: int) -> HttpResponse:
    user = get_object_or_404(User, pk=pk)
    if request.user == user:
        messages.error(request, "You cannot delete your own account.")
        return redirect("admin_panel:admin_users")
    if request.method == "POST":
        user.delete()
        messages.success(request, "User deleted successfully.")
        return redirect("admin_panel:admin_users")
    return render(
        request,
        "admin_panel/users_form.html",
        {"delete_confirm": True, "edited_user": user},
    )


@staff_required
def tasks_list(request: HttpRequest) -> HttpResponse:
    tasks_qs = Task.objects.select_related("owner").all().order_by("due_date", "title")

    if request.method == "POST":
        action = request.POST.get("action")
        task_id = request.POST.get("task_id")
        task = get_object_or_404(Task, pk=task_id) if task_id else None
        if action == "update" and task:
            owner_id = request.POST.get("owner")
            status = request.POST.get("status")
            priority = request.POST.get("priority")
            due_date_raw = request.POST.get("due_date")
            title = request.POST.get("title")
            description = request.POST.get("description")

            if owner_id:
                task.owner = get_object_or_404(User, pk=owner_id)
            if status in dict(Task.STATUS_CHOICES):
                task.status = status
            if priority in dict(Task.PRIORITY_CHOICES):
                task.priority = priority
            if due_date_raw:
                try:
                    task.due_date = date.fromisoformat(due_date_raw)
                except ValueError:
                    messages.error(request, "Invalid due date.")
                    return redirect("admin_panel:admin_tasks")
            else:
                task.due_date = None
            if title:
                task.title = title
            task.description = description or ""
            task.save()
            messages.success(request, "Task updated successfully.")
            return redirect("admin_panel:admin_tasks")
        elif action == "delete" and task:
            task.delete()
            messages.success(request, "Task deleted successfully.")
            return redirect("admin_panel:admin_tasks")

    owner_filter = request.GET.get("owner")
    status_filter = request.GET.get("status")
    priority_filter = request.GET.get("priority")
    due_before = request.GET.get("due_before")

    if owner_filter:
        tasks_qs = tasks_qs.filter(owner__id=owner_filter)
    if status_filter:
        tasks_qs = tasks_qs.filter(status=status_filter)
    if priority_filter:
        tasks_qs = tasks_qs.filter(priority=priority_filter)
    if due_before:
        try:
            parsed_date = date.fromisoformat(due_before)
            tasks_qs = tasks_qs.filter(due_date__lte=parsed_date)
        except ValueError:
            messages.error(request, "Invalid date provided.")

    context = {
        "tasks": tasks_qs,
        "users": User.objects.all().order_by("username"),
        "filters": {
            "owner": owner_filter or "",
            "status": status_filter or "",
            "priority": priority_filter or "",
            "due_before": due_before or "",
        },
    }
    return render(request, "admin_panel/tasks_list.html", context)
