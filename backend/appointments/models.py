from django.conf import settings
from django.db import models


class Doctor(models.Model):
    name = models.CharField(max_length=150)
    specialization = models.CharField(max_length=150)
    availability_schedule = models.TextField(help_text="Describe available days and times.")

    def __str__(self) -> str:
        return f"{self.name} ({self.specialization})"


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        APPROVED = "Approved", "Approved"
        REJECTED = "Rejected", "Rejected"

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    date = models.DateField()
    time = models.TimeField()
    symptoms = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-time"]
        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "date", "time"],
                condition=~models.Q(status="Rejected"),
                name="unique_active_appointment",
            )
        ]

    def __str__(self) -> str:
        return f"{self.patient.email} -> {self.doctor.name} on {self.date} {self.time}"
