from __future__ import annotations

from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _

from tasks.models import Task

User = get_user_model()


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email


class UserAdminForm(forms.ModelForm):
    role = forms.ChoiceField(choices=[("user", "User"), ("staff", "Admin")], initial="user")
    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput,
        help_text=_("Leave blank to keep the current password."),
    )

    class Meta:
        model = User
        fields = ("username", "email", "is_active", "password")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields["role"].initial = "staff" if self.instance.is_staff else "user"
            self.fields["password"].help_text = _("Leave blank to keep the current password.")
            self.fields["password"].required = False
        else:
            self.fields["password"].required = True
            self.fields["password"].help_text = _("Set an initial password for the user.")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        queryset = User.objects.filter(email__iexact=email)
        if self.instance.pk:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        role = self.cleaned_data.get("role")
        user.is_staff = role == "staff"
        if not user.pk:
            user.is_superuser = False
        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)
        elif not user.pk:
            raise forms.ValidationError("Password is required for new users.")
        if commit:
            user.save()
        return user


class TaskAdminForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ("owner", "title", "description", "due_date", "priority", "status")
        widgets = {
            "due_date": forms.DateInput(attrs={"type": "date"}),
        }
