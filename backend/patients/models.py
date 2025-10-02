from django.conf import settings
from django.db import models


class Patient(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=50)
    contact_info = models.JSONField(default=dict, blank=True)

    def __str__(self) -> str:
        return self.name
