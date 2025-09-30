from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .models import Task


class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "priority", "status", "due_date", "created_at")
    list_filter = ("priority", "status", "due_date")
    search_fields = ("title", "description", "user__username")
    ordering = ("-created_at",)


class TaskAdminSite(admin.AdminSite):
    site_header = "To-Do Administration"
    site_title = "To-Do Admin"
    index_title = "Dashboard"
    index_template = "admin/index.html"

    def each_context(self, request):
        context = super().each_context(request)
        User = get_user_model()
        context.update(
            {
                "total_users": User.objects.count(),
                "total_tasks": Task.objects.count(),
            }
        )
        return context


admin_site = TaskAdminSite(name="task_admin")
admin_site.register(Task, TaskAdmin)
admin_site.register(get_user_model(), UserAdmin)
