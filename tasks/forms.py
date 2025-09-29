from django import forms

from .models import Task


class TaskForm(forms.ModelForm):
    user_id = forms.IntegerField(widget=forms.HiddenInput())

    class Meta:
        model = Task
        fields = ["title", "description", "due_date", "priority", "status"]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
        }

    def save(self, commit=True):
        task = super().save(commit=False)
        if commit:
            task.save()
        return task
