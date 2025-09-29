from __future__ import annotations

from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import PasswordChangeView
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views import View

from tasks.forms import TaskForm
from tasks.models import Task

from .forms import AdminUserCreateForm, AdminUserUpdateForm, RegistrationForm


class RegisterView(View):
    template_name = "accounts/register.html"

    def get(self, request: HttpRequest) -> HttpResponse:
        form = RegistrationForm()
        return render(request, self.template_name, {"form": form})

    def post(self, request: HttpRequest) -> HttpResponse:
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data["email"].lower()
            user.is_staff = False
            user.save()
            messages.success(request, "Registration successful. You can now log in.")
            return redirect("accounts:login")
        return render(request, self.template_name, {"form": form})


class ChangePasswordView(LoginRequiredMixin, PasswordChangeView):
    success_url = reverse_lazy("tasks:dashboard")

    def form_valid(self, form):  # type: ignore[override]
        messages.success(self.request, "Your password has been changed successfully.")
        return super().form_valid(form)


staff_required = user_passes_test(lambda user: user.is_staff, login_url=reverse_lazy("accounts:login"))


@login_required
@staff_required
def admin_dashboard(request: HttpRequest) -> HttpResponse:
    total_users = User.objects.count()
    total_tasks = Task.objects.count()
    status_counts = Task.objects.values("status").annotate(total=Count("id"))
    counts = {item["status"]: item["total"] for item in status_counts}
    context = {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "pending_count": counts.get("pending", 0),
        "in_progress_count": counts.get("in_progress", 0),
        "completed_count": counts.get("completed", 0),
    }
    return render(request, "admin_panel/dashboard.html", context)


@login_required
@staff_required
def users_list(request: HttpRequest) -> HttpResponse:
    query = request.GET.get("q", "")
    users = User.objects.all().order_by("username")
    if query:
        users = users.filter(
            (Q(username__icontains=query)) | (Q(email__icontains=query))
        )
    context = {
        "users": users,
        "query": query,
    }
    return render(request, "admin_panel/users_list.html", context)


@login_required
@staff_required
def users_add(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        form = AdminUserCreateForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f"User '{user.username}' created successfully.")
            return redirect("admin_panel:admin_users")
    else:
        form = AdminUserCreateForm()
    return render(request, "admin_panel/users_form.html", {"form": form, "is_edit": False})


@login_required
@staff_required
def users_edit(request: HttpRequest, pk: int) -> HttpResponse:
    user_obj = get_object_or_404(User, pk=pk)
    if request.method == "POST":
        form = AdminUserUpdateForm(request.POST, instance=user_obj)
        if form.is_valid():
            form.save()
            messages.success(request, "User updated successfully.")
            return redirect("admin_panel:admin_users")
    else:
        form = AdminUserUpdateForm(instance=user_obj)
    return render(
        request,
        "admin_panel/users_form.html",
        {"form": form, "is_edit": True, "user_obj": user_obj},
    )


@login_required
@staff_required
def users_delete(request: HttpRequest, pk: int) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid request method.")
    if request.user.pk == pk:
        messages.error(request, "You cannot delete your own account.")
        return redirect("admin_panel:admin_users")
    user_obj = get_object_or_404(User, pk=pk)
    username = user_obj.username
    user_obj.delete()
    messages.success(request, f"User '{username}' deleted successfully.")
    return redirect("admin_panel:admin_users")


@login_required
@staff_required
def tasks_list(request: HttpRequest) -> HttpResponse:
    tasks_qs = Task.objects.select_related("owner").all()

    owner_id = request.GET.get("owner")
    status = request.GET.get("status")
    priority = request.GET.get("priority")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if owner_id:
        tasks_qs = tasks_qs.filter(owner_id=owner_id)
    if status:
        tasks_qs = tasks_qs.filter(status=status)
    if priority:
        tasks_qs = tasks_qs.filter(priority=priority)
    if start_date:
        tasks_qs = tasks_qs.filter(due_date__gte=start_date)
    if end_date:
        tasks_qs = tasks_qs.filter(due_date__lte=end_date)

    task_to_edit = None
    current_query = request.GET.copy()
    if "edit" in current_query:
        current_query.pop("edit")
    query_string = current_query.urlencode()

    if request.method == "POST":
        action = request.POST.get("action")
        task_id = request.POST.get("task_id")
        task = get_object_or_404(Task, pk=task_id) if task_id else None
        if action == "delete" and task:
            task.delete()
            messages.success(request, "Task deleted successfully.")
            return redirect("admin_panel:admin_tasks")
        if action == "reassign" and task:
            new_owner_id = request.POST.get("new_owner")
            if new_owner_id and User.objects.filter(pk=new_owner_id).exists():
                task.owner_id = new_owner_id
                task.save()
                messages.success(request, "Task reassigned successfully.")
                return redirect("admin_panel:admin_tasks")
            messages.error(request, "Invalid owner selected for reassignment.")
        if action == "update" and task:
            form = TaskForm(request.POST, instance=task)
            if form.is_valid():
                updated_task = form.save(commit=False)
                updated_task.owner = task.owner
                updated_task.save()
                messages.success(request, "Task updated successfully.")
                return redirect("admin_panel:admin_tasks")
            edit_form = form
            task_to_edit = task
        else:
            edit_form = None
    else:
        edit_form = None

    edit_id = request.GET.get("edit")
    if not edit_form and edit_id:
        task_to_edit = get_object_or_404(Task, pk=edit_id)
        edit_form = TaskForm(instance=task_to_edit)

    owners = User.objects.order_by("username")
    context = {
        "tasks": tasks_qs,
        "owners": owners,
        "selected_owner": owner_id or "",
        "selected_status": status or "",
        "selected_priority": priority or "",
        "start_date": start_date or "",
        "end_date": end_date or "",
        "edit_form": edit_form,
        "task_to_edit": task_to_edit,
        "query_string": query_string,
    }
    return render(request, "admin_panel/tasks_list.html", context)
