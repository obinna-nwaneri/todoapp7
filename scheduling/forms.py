from __future__ import annotations

from django import forms

from .models import Appointment, TimeOff, WorkingHours


class AppointmentBookingForm(forms.Form):
    doctor_id = forms.IntegerField(widget=forms.HiddenInput)
    start = forms.DateTimeField(widget=forms.HiddenInput)
    appointment_type = forms.ChoiceField(choices=Appointment._meta.get_field("type").choices)
    reason = forms.CharField(widget=forms.Textarea(attrs={"rows": 3}), required=False)


class AppointmentActionForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ("reason_text",)
        widgets = {"reason_text": forms.Textarea(attrs={"rows": 3})}


class RescheduleForm(forms.Form):
    new_start = forms.DateTimeField(widget=forms.HiddenInput)


class WorkingHoursForm(forms.ModelForm):
    class Meta:
        model = WorkingHours
        fields = ("day_of_week", "start_time", "end_time")
        widgets = {
            "start_time": forms.TimeInput(attrs={"type": "time"}),
            "end_time": forms.TimeInput(attrs={"type": "time"}),
        }


class TimeOffForm(forms.ModelForm):
    class Meta:
        model = TimeOff
        fields = ("start_datetime", "end_datetime", "reason")
        widgets = {
            "start_datetime": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "end_datetime": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "reason": forms.Textarea(attrs={"rows": 3}),
        }


