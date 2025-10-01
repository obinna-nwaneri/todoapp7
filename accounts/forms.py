from __future__ import annotations

from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import Group

from .models import DoctorProfile, PatientProfile, User


class LoginForm(AuthenticationForm):
    username = forms.CharField(label="Email or Username")

    def clean(self):
        username = self.cleaned_data.get("username")
        if username and "@" in username:
            try:
                user = User.objects.get(email__iexact=username)
                self.cleaned_data["username"] = user.username
            except User.DoesNotExist:
                pass
        return super().clean()


class PatientRegistrationForm(UserCreationForm):
    phone = forms.CharField(required=False)

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "username",
            "phone",
        )

    def save(self, commit: bool = True) -> User:
        user: User = super().save(commit=False)
        user.email = self.cleaned_data["email"].lower()
        user.username = self.cleaned_data["username"].lower()
        user.preferred_role = User.ROLE_PATIENT
        if commit:
            user.save()
            group, _ = Group.objects.get_or_create(name=User.ROLE_PATIENT)
            user.groups.add(group)
            PatientProfile.objects.get_or_create(user=user)
        return user


class DoctorRegistrationForm(UserCreationForm):
    phone = forms.CharField(required=False)
    specialty = forms.ModelChoiceField(queryset=DoctorProfile._meta.get_field("specialty").remote_field.model.objects.all())
    years_experience = forms.IntegerField(min_value=0)
    location = forms.CharField()
    fee = forms.DecimalField(min_value=0)
    bio = forms.CharField(widget=forms.Textarea, required=False)

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "username",
            "phone",
        )

    def save(self, commit: bool = True) -> User:
        user: User = super().save(commit=False)
        user.email = self.cleaned_data["email"].lower()
        user.username = self.cleaned_data["username"].lower()
        user.preferred_role = User.ROLE_DOCTOR
        user.is_active = False  # requires admin approval
        if commit:
            user.save()
            group, _ = Group.objects.get_or_create(name=User.ROLE_DOCTOR)
            user.groups.add(group)
            DoctorProfile.objects.create(
                user=user,
                specialty=self.cleaned_data["specialty"],
                years_experience=self.cleaned_data["years_experience"],
                location=self.cleaned_data["location"],
                fee=self.cleaned_data["fee"],
                bio=self.cleaned_data.get("bio", ""),
            )
        return user


class PatientProfileForm(forms.ModelForm):
    class Meta:
        model = PatientProfile
        fields = ("gender", "dob", "address")
        widgets = {
            "dob": forms.DateInput(attrs={"type": "date"}),
            "address": forms.Textarea(attrs={"rows": 3}),
        }


class DoctorProfileForm(forms.ModelForm):
    class Meta:
        model = DoctorProfile
        fields = (
            "specialty",
            "years_experience",
            "location",
            "fee",
            "bio",
            "available_for_virtual",
        )
        widgets = {"bio": forms.Textarea(attrs={"rows": 4})}


