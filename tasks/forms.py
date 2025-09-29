from django import forms
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm, UserCreationForm

from .models import Task


class DateInput(forms.DateInput):
    input_type = "date"


class TaskForm(forms.ModelForm):
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
            "description": forms.Textarea(attrs={"rows": 4}),
            "due_date": DateInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            existing_classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = (
                existing_classes
                + " block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            ).strip()
        self.fields["title"].widget.attrs.setdefault("required", "required")
        self.fields["title"].widget.attrs.setdefault("placeholder", "Task title")
        self.fields["description"].widget.attrs.setdefault(
            "placeholder", "Details to remember"
        )


class StyledAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = (
                classes
                + " mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            ).strip()
        self.fields["username"].widget.attrs.setdefault("placeholder", "Username")
        self.fields["password"].widget.attrs.setdefault("placeholder", "Password")


class StyledPasswordChangeForm(PasswordChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = (
                classes
                + " mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            ).strip()
            field.widget.attrs.setdefault("placeholder", field.label)


class StyledUserCreationForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            classes = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = (
                classes
                + " mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            ).strip()
            field.widget.attrs.setdefault("placeholder", field.label)
