from django import forms

from .models import Task


class TaskForm(forms.ModelForm):
    user_id = forms.IntegerField(widget=forms.HiddenInput())

    class Meta:
        model = Task
        fields = ["title", "description", "due_date", "priority", "status", "user_id"]
        widgets = {
            "due_date": forms.DateInput(attrs={"type": "date"}),
        }
