from __future__ import annotations

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_email(self) -> str:
        email = self.cleaned_data.get("email", "").lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email


ROLE_CHOICES = (
    ("user", "User"),
    ("admin", "Admin"),
)


class AdminUserCreateForm(UserCreationForm):
    email = forms.EmailField(required=True)
    role = forms.ChoiceField(choices=ROLE_CHOICES, initial="user")

    class Meta:
        model = User
        fields = ("username", "email", "role")

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            widget = field.widget
            if field_name in {"role"}:
                widget.attrs.setdefault("class", "form-select")
            elif field_name in {"password1", "password2"}:
                widget.attrs.setdefault("class", "form-control")
                widget.attrs.setdefault("placeholder", field.label)
            else:
                widget.attrs.setdefault("class", "form-control")

    def save(self, commit: bool = True) -> User:
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"].lower()
        user.is_staff = self.cleaned_data.get("role") == "admin"
        if commit:
            user.save()
        return user

    def clean_email(self) -> str:
        email = self.cleaned_data.get("email", "").lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email


class AdminUserUpdateForm(forms.ModelForm):
    role = forms.ChoiceField(choices=ROLE_CHOICES)
    new_password1 = forms.CharField(
        label="New password",
        required=False,
        widget=forms.PasswordInput,
        help_text="Leave blank to keep the current password.",
    )
    new_password2 = forms.CharField(
        label="Confirm new password",
        required=False,
        widget=forms.PasswordInput,
    )

    class Meta:
        model = User
        fields = ("username", "email", "role")

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.is_staff:
            self.initial.setdefault("role", "admin")
        else:
            self.initial.setdefault("role", "user")
        for field_name, field in self.fields.items():
            widget = field.widget
            if field_name == "role":
                widget.attrs.setdefault("class", "form-select")
            else:
                widget.attrs.setdefault("class", "form-control")
        self.fields["new_password1"].widget.attrs.setdefault("class", "form-control")
        self.fields["new_password2"].widget.attrs.setdefault("class", "form-control")

    def clean_email(self) -> str:
        email = self.cleaned_data.get("email", "").lower()
        qs = User.objects.filter(email__iexact=email)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email

    def clean(self) -> dict[str, str]:
        cleaned_data = super().clean()
        pwd1 = cleaned_data.get("new_password1")
        pwd2 = cleaned_data.get("new_password2")
        if pwd1 or pwd2:
            if pwd1 != pwd2:
                raise forms.ValidationError("The two password fields didn't match.")
        return cleaned_data

    def save(self, commit: bool = True) -> User:
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"].lower()
        user.is_staff = self.cleaned_data.get("role") == "admin"
        if commit:
            user.save()
            new_password = self.cleaned_data.get("new_password1")
            if new_password:
                user.set_password(new_password)
                user.save()
        return user
