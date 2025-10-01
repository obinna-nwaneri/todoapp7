from __future__ import annotations

from django import forms

from accounts.models import DoctorProfile
from content.models import Announcement, CmsPage, FAQ
from directory.models import Specialty


class SpecialtyForm(forms.ModelForm):
    class Meta:
        model = Specialty
        fields = ("name", "description", "featured")


class FAQForm(forms.ModelForm):
    class Meta:
        model = FAQ
        fields = ("question", "answer", "ordering")


class CmsPageForm(forms.ModelForm):
    class Meta:
        model = CmsPage
        fields = ("slug", "title", "content")
        widgets = {"content": forms.Textarea(attrs={"rows": 8})}


class AnnouncementForm(forms.ModelForm):
    class Meta:
        model = Announcement
        fields = ("title", "message", "audience", "published_at")
        widgets = {"published_at": forms.DateTimeInput(attrs={"type": "datetime-local"})}


