from __future__ import annotations

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from audit.models import ActivityLog

from .forms import TaskForm
from .models import Task


def _log_task_action(user, action: str, task: Task) -> None:
    ActivityLog.objects.create(
        user=user,
        action=action,
        entity="Task",
        entity_id=task.pk,
        meta={
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
        },
    )


def _apply_filters(request: HttpRequest, queryset):
    status = request.GET.get("status") or ""
    priority = request.GET.get("priority") or ""
    query = request.GET.get("q") or ""

    if status:
        queryset = queryset.filter(status=status)
    if priority:
        queryset = queryset.filter(priority=priority)
    if query:
        queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query))
    return queryset


def _get_task_for_user(request: HttpRequest, pk: int) -> Task:
    if request.user.is_staff:
        return get_object_or_404(Task, pk=pk)
    return get_object_or_404(Task, pk=pk, owner=request.user)


@login_required
def dashboard(request: HttpRequest) -> HttpResponse:
    tasks = Task.objects.filter(owner=request.user)
    tasks = _apply_filters(request, tasks)

    paginator = Paginator(tasks, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    context = {
        "form": TaskForm(initial={"user_id": request.user.id}),
        "page_obj": page_obj,
        "tasks": page_obj.object_list,
        "status_value": request.GET.get("status", ""),
        "priority_value": request.GET.get("priority", ""),
        "query_value": request.GET.get("q", ""),
    }

    if request.headers.get("HX-Request"):
        return render(request, "tasks/_table.html", context)
    return render(request, "tasks/dashboard.html", context)


@login_required
@require_http_methods(["GET", "POST"])
def task_create(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.owner = request.user
            task.save()
            _log_task_action(request.user, "task_create", task)
            messages.success(request, "Task created successfully.")
            return redirect("tasks:dashboard")
    else:
        form = TaskForm(initial={"user_id": request.user.id})
    return render(request, "tasks/task_form.html", {"form": form, "title": "Add Task"})


@login_required
@require_http_methods(["GET", "POST"])
def task_edit(request: HttpRequest, pk: int) -> HttpResponse:
    task = _get_task_for_user(request, pk)

    if not request.user.is_staff and task.owner != request.user:
        raise Http404

    if request.method == "POST":
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            updated_task = form.save(commit=False)
            # Always keep current owner for non-staff; staff may reassign by changing instance.owner directly before saving
            if request.user.is_staff:
                updated_task.owner = task.owner
            else:
                updated_task.owner = request.user
            updated_task.save()
            _log_task_action(request.user, "task_update", updated_task)
            messages.success(request, "Task updated successfully.")
            return redirect("tasks:dashboard")
    else:
        form = TaskForm(instance=task, initial={"user_id": request.user.id})
    return render(request, "tasks/task_form.html", {"form": form, "title": "Edit Task", "task": task})


@login_required
@require_http_methods(["GET", "POST"])
def task_delete(request: HttpRequest, pk: int) -> HttpResponse:
    task = _get_task_for_user(request, pk)

    if not request.user.is_staff and task.owner != request.user:
        raise Http404

    if request.method == "POST":
        _log_task_action(request.user, "task_delete", task)
        task.delete()
        messages.success(request, "Task deleted successfully.")
        return redirect("tasks:dashboard")

    return render(request, "tasks/confirm_delete.html", {"task": task})


@login_required
def tasks_table_partial(request: HttpRequest) -> HttpResponse:
    tasks = Task.objects.filter(owner=request.user)
    tasks = _apply_filters(request, tasks)

    paginator = Paginator(tasks, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    context = {
        "page_obj": page_obj,
        "tasks": page_obj.object_list,
        "status_value": request.GET.get("status", ""),
        "priority_value": request.GET.get("priority", ""),
        "query_value": request.GET.get("q", ""),
    }
    return render(request, "tasks/_table.html", context)
