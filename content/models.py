from __future__ import annotations

from django.db import models


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("ordering", "question")

    def __str__(self) -> str:  # pragma: no cover
        return self.question


class CmsPage(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    content = models.TextField()

    class Meta:
        ordering = ("slug",)

    def __str__(self) -> str:  # pragma: no cover
        return self.title


class Announcement(models.Model):
    AUDIENCE_CHOICES = (
        ("ALL", "All"),
        ("PATIENTS", "Patients"),
        ("DOCTORS", "Doctors"),
    )

    title = models.CharField(max_length=255)
    message = models.TextField()
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default="ALL")
    published_at = models.DateTimeField()

    class Meta:
        ordering = ("-published_at",)

    def __str__(self) -> str:  # pragma: no cover
        return self.title


