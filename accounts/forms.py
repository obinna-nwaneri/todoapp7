from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email", "").lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email


class StaffUserForm(forms.ModelForm):
    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput,
        help_text="Leave blank to keep the existing password.",
    )
    confirm_password = forms.CharField(
        required=False,
        widget=forms.PasswordInput,
        label="Confirm Password",
    )
    role = forms.ChoiceField(
        choices=(
            ("user", "User"),
            ("admin", "Admin"),
        )
    )

    class Meta:
        model = User
        fields = ("username", "email", "role", "password", "confirm_password")

    def clean_email(self):
        email = self.cleaned_data.get("email", "").lower()
        if User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError("A user with that email already exists.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password or confirm_password:
            if password != confirm_password:
                raise forms.ValidationError("Passwords do not match.")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        role = self.cleaned_data.get("role")
        user.is_staff = role == "admin"
        if commit:
            user.save()
            password = self.cleaned_data.get("password")
            if password:
                user.set_password(password)
                user.save()
        else:
            password = self.cleaned_data.get("password")
            if password:
                user.set_password(password)
        return user
