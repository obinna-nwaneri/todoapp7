from __future__ import annotations

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from .forms import TaskForm
from .models import Task


@login_required
def dashboard(request: HttpRequest) -> HttpResponse:
    tasks = request.user.tasks.all()
    status = request.GET.get("status")
    priority = request.GET.get("priority")
    query = request.GET.get("q")

    if status:
        tasks = tasks.filter(status=status)
    if priority:
        tasks = tasks.filter(priority=priority)
    if query:
        tasks = tasks.filter(title__icontains=query)

    context = {
        "tasks": tasks,
        "status": status or "",
        "priority": priority or "",
        "query": query or "",
    }
    return render(request, "tasks/dashboard.html", context)


@login_required
def task_create(request: HttpRequest) -> HttpResponse:
    if request.method == "POST":
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.owner = request.user
            task.save()
            messages.success(request, "Task created successfully.")
            return redirect("tasks:dashboard")
    else:
        form = TaskForm(initial={"user_id": request.user.id})
    return render(request, "tasks/task_form.html", {"form": form, "is_edit": False})


@login_required
def task_edit(request: HttpRequest, pk: int) -> HttpResponse:
    task = get_object_or_404(Task, pk=pk, owner=request.user)
    if request.method == "POST":
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            updated_task = form.save(commit=False)
            updated_task.owner = request.user
            updated_task.save()
            messages.success(request, "Task updated successfully.")
            return redirect("tasks:dashboard")
    else:
        form = TaskForm(instance=task, initial={"user_id": request.user.id})
    return render(request, "tasks/task_form.html", {"form": form, "is_edit": True, "task": task})


@login_required
def task_delete(request: HttpRequest, pk: int) -> HttpResponse:
    task = get_object_or_404(Task, pk=pk, owner=request.user)
    if request.method == "POST":
        task.delete()
        messages.success(request, "Task deleted successfully.")
        return redirect("tasks:dashboard")
    return render(request, "tasks/confirm_delete.html", {"task": task})
