from __future__ import annotations

from django import forms

from .models import Task


class TaskForm(forms.ModelForm):
    user_id = forms.IntegerField(widget=forms.HiddenInput, required=False)

    class Meta:
        model = Task
        fields = [
            "title",
            "description",
            "due_date",
            "priority",
            "status",
        ]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control", "required": True}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 4}),
            "due_date": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
            "priority": forms.Select(attrs={"class": "form-select"}),
            "status": forms.Select(attrs={"class": "form-select"}),
        }

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.fields["title"].widget.attrs.setdefault("placeholder", "Task title")
        self.fields["description"].required = False
        self.fields["due_date"].required = False
        if self.instance and self.instance.pk:
            self.fields["user_id"].initial = self.instance.owner_id

    def save(self, commit: bool = True):  # type: ignore[override]
        task = super().save(commit=False)
        if commit:
            task.save()
        return task
