from django import forms
from django.contrib.auth.models import User

from .models import Appointment, Doctor, Patient


class DoctorForm(forms.ModelForm):
    class Meta:
        model = Doctor
        fields = ["user", "name", "specialization", "availability_schedule"]
        widgets = {
            "availability_schedule": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        exclude_ids = Doctor.objects.exclude(pk=self.instance.pk if self.instance else None).values_list("user_id", flat=True)
        queryset = User.objects.exclude(id__in=exclude_ids)
        if self.instance and self.instance.user_id:
            queryset = (queryset | User.objects.filter(pk=self.instance.user_id))
        self.fields["user"].queryset = queryset.distinct().order_by("username")


class PatientForm(forms.ModelForm):
    class Meta:
        model = Patient
        fields = ["user", "name", "age", "gender", "contact_info"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        exclude_ids = Patient.objects.exclude(pk=self.instance.pk if self.instance else None).values_list("user_id", flat=True)
        queryset = User.objects.exclude(id__in=exclude_ids)
        if self.instance and self.instance.user_id:
            queryset = (queryset | User.objects.filter(pk=self.instance.user_id))
        self.fields["user"].queryset = queryset.distinct().order_by("username")


class AppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ["doctor", "date", "time", "symptoms"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
            "time": forms.TimeInput(attrs={"type": "time"}),
            "symptoms": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["doctor"].queryset = Doctor.objects.order_by("name")


class AdminAppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ["patient", "doctor", "date", "time", "symptoms", "status"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
            "time": forms.TimeInput(attrs={"type": "time"}),
            "symptoms": forms.Textarea(attrs={"rows": 3}),
        }


class AppointmentStatusForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ["status"]
