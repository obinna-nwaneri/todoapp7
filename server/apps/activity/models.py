from django.conf import settings
from django.db import models
from django.utils import timezone


class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ("login", "Login"),
        ("logout", "Logout"),
        ("task_create", "Task Created"),
        ("task_update", "Task Updated"),
        ("task_delete", "Task Deleted"),
        ("password_change", "Password Changed"),
        ("register", "Register"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    action = models.CharField(max_length=64)
    context = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:  # pragma: no cover
        user_display = self.user.username if self.user else "anonymous"
        return f"{user_display} {self.action} at {self.created_at:%Y-%m-%d %H:%M:%S}"
