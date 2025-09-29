from django.contrib.auth import get_user_model
from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

User = get_user_model()


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ("login", "Login"),
        ("logout", "Logout"),
        ("task_create", "Task Created"),
        ("task_update", "Task Updated"),
        ("task_delete", "Task Deleted"),
        ("user_create", "User Created"),
        ("user_update", "User Updated"),
        ("user_delete", "User Deleted"),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    entity = models.CharField(max_length=30, blank=True)
    entity_id = models.IntegerField(null=True, blank=True)
    meta = models.JSONField(null=True, blank=True, encoder=DjangoJSONEncoder)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.action} by {self.user or 'Unknown'}"
