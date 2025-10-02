from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User

from .models import Appointment, Doctor


class TailwindFormMixin:
    input_css = "w-full rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500"

    def _apply_styles(self):
        for field in self.fields.values():
            existing = field.widget.attrs.get("class", "")
            field.widget.attrs["class"] = f"{existing} {self.input_css}".strip()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_styles()


class PatientRegistrationForm(TailwindFormMixin, UserCreationForm):
    email = forms.EmailField(required=False)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")


class PatientAuthenticationForm(TailwindFormMixin, AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={"autofocus": True}))


class AppointmentForm(TailwindFormMixin, forms.ModelForm):
    date = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    time = forms.TimeField(widget=forms.TimeInput(attrs={"type": "time"}))

    class Meta:
        model = Appointment
        fields = ("doctor", "date", "time", "symptoms")
        widgets = {
            "symptoms": forms.Textarea(attrs={"rows": 3}),
        }


class DoctorForm(TailwindFormMixin, forms.ModelForm):
    class Meta:
        model = Doctor
        fields = ("name", "specialization", "availability_schedule")
        widgets = {
            "availability_schedule": forms.Textarea(attrs={"rows": 3}),
        }


class UserProfileForm(TailwindFormMixin, forms.ModelForm):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "email")
