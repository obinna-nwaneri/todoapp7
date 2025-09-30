from __future__ import annotations

from datetime import datetime, timedelta

from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.utils import timezone

from .models import Appointment, DoctorProfile, PatientProfile, WeeklyAvailability
from .services import generate_slots_for_doctor, is_slot_available

User = get_user_model()


class UserRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit: bool = True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class PatientProfileForm(forms.ModelForm):
    class Meta:
        model = PatientProfile
        fields = ("phone", "dob", "gender", "address")
        widgets = {
            "dob": forms.DateInput(attrs={"type": "date"}),
        }


class DoctorProfileForm(forms.ModelForm):
    class Meta:
        model = DoctorProfile
        fields = (
            "specialty",
            "clinic",
            "bio",
            "fee",
            "slot_length_minutes",
            "is_active",
        )


class AvailabilityForm(forms.ModelForm):
    class Meta:
        model = WeeklyAvailability
        fields = ("weekday", "start_time", "end_time", "slot_length_minutes")
        widgets = {
            "start_time": forms.TimeInput(format="%H:%M", attrs={"type": "time"}),
            "end_time": forms.TimeInput(format="%H:%M", attrs={"type": "time"}),
        }


AvailabilityFormSet = forms.inlineformset_factory(
    DoctorProfile,
    WeeklyAvailability,
    form=AvailabilityForm,
    extra=1,
    can_delete=True,
)


class AppointmentRequestForm(forms.ModelForm):
    doctor = forms.ModelChoiceField(
        queryset=DoctorProfile.objects.filter(is_active=True),
        required=True,
        label="Doctor",
    )
    date = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    slot = forms.ChoiceField(label="Time Slot")

    class Meta:
        model = Appointment
        fields = ("doctor", "date", "slot", "reason")
        widgets = {
            "reason": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, patient: User, **kwargs):
        self.patient = patient
        super().__init__(*args, **kwargs)
        self.fields["slot"].choices = []
        if "doctor" in self.data and "date" in self.data:
            self._populate_slot_choices_from_data()
        elif self.initial.get("doctor") and self.initial.get("date"):
            self._populate_slot_choices(
                self.initial["doctor"],
                self.initial["date"],
            )

    def _populate_slot_choices_from_data(self):
        try:
            doctor_id = int(self.data.get("doctor"))
            doctor_profile = DoctorProfile.objects.get(pk=doctor_id, is_active=True)
            date_value = self.fields["date"].to_python(self.data.get("date"))
            if date_value:
                self._populate_slot_choices(doctor_profile, date_value)
        except (TypeError, ValueError, DoctorProfile.DoesNotExist):
            pass

    def _populate_slot_choices(self, doctor, date_value):
        if isinstance(doctor, (int, str)):
            try:
                doctor = DoctorProfile.objects.get(pk=doctor, is_active=True)
            except DoctorProfile.DoesNotExist:
                return
        if isinstance(date_value, str):
            date_value = self.fields["date"].to_python(date_value)
        if not doctor or not date_value:
            return
        slots = generate_slots_for_doctor(doctor.user, date_value, weeks=0)
        same_day_slots = [
            slot for slot in slots if timezone.localdate(slot[0]) == date_value
        ]
        choices = [
            (
                slot[0].isoformat(),
                f"{timezone.localtime(slot[0]):%I:%M %p} - {timezone.localtime(slot[1]):%I:%M %p}",
            )
            for slot in same_day_slots
            if is_slot_available(doctor.user, slot[0], slot[1])
        ]
        self.fields["slot"].choices = choices

    def clean_slot(self):
        value = self.cleaned_data.get("slot")
        if not value:
            raise forms.ValidationError("Please select a time slot.")
        try:
            start = datetime.fromisoformat(value)
        except ValueError as exc:
            raise forms.ValidationError("Invalid slot selection.") from exc
        return start

    def clean(self):
        cleaned_data = super().clean()
        doctor_profile: DoctorProfile | None = cleaned_data.get("doctor")
        slot_start: datetime | None = cleaned_data.get("slot")
        if doctor_profile and slot_start:
            if timezone.is_naive(slot_start):
                slot_start = timezone.make_aware(slot_start, timezone.get_current_timezone())
            slot_end = slot_start + timedelta(minutes=doctor_profile.slot_length_minutes)
            if not is_slot_available(doctor_profile.user, slot_start, slot_end):
                self.add_error("slot", "Selected slot is no longer available.")
            cleaned_data["slot_start"] = slot_start
            cleaned_data["slot_end"] = slot_end
            cleaned_data["doctor_profile"] = doctor_profile
            cleaned_data["doctor"] = doctor_profile.user
            self.instance.start = slot_start
            self.instance.end = slot_end
            self.instance.doctor = doctor_profile.user
            self.instance.patient = self.patient
        return cleaned_data

    def save(self, commit: bool = True):
        appointment: Appointment = super().save(commit=False)
        doctor_profile: DoctorProfile | None = self.cleaned_data.get("doctor_profile")
        slot_start = self.cleaned_data.get("slot_start")
        slot_end = self.cleaned_data.get("slot_end")
        if not doctor_profile or slot_start is None or slot_end is None:
            raise forms.ValidationError("Unable to process the selected slot.")
        appointment.patient = self.patient
        appointment.doctor = doctor_profile.user
        appointment.start = slot_start
        appointment.end = slot_end
        if commit:
            appointment.save()
        return appointment


class AppointmentRescheduleForm(forms.ModelForm):
    slot = forms.ChoiceField(label="New Time Slot")

    class Meta:
        model = Appointment
        fields = ("slot",)

    def __init__(self, *args, appointment: Appointment, **kwargs):
        self.appointment = appointment
        super().__init__(*args, **kwargs)
        today = timezone.localdate()
        slots = generate_slots_for_doctor(appointment.doctor, today)
        choices = []
        for start, end in slots:
            if start <= timezone.now():
                continue
            if not is_slot_available(appointment.doctor, start, end, exclude_appointment_id=appointment.pk):
                continue
            choices.append(
                (
                    start.isoformat(),
                    f"{timezone.localtime(start):%b %d, %I:%M %p}",
                )
            )
        self.fields["slot"].choices = choices

    def clean_slot(self):
        value = self.cleaned_data.get("slot")
        if not value:
            raise forms.ValidationError("Please select a valid slot.")
        try:
            start = datetime.fromisoformat(value)
        except ValueError as exc:
            raise forms.ValidationError("Invalid slot selection.") from exc
        return start

    def clean(self):
        cleaned_data = super().clean()
        slot_start: datetime | None = cleaned_data.get("slot")
        if slot_start:
            if timezone.is_naive(slot_start):
                slot_start = timezone.make_aware(slot_start, timezone.get_current_timezone())
            slot_length = self.appointment.doctor.doctor_profile.slot_length_minutes
            slot_end = slot_start + timedelta(minutes=slot_length)
            if not is_slot_available(
                self.appointment.doctor,
                slot_start,
                slot_end,
                exclude_appointment_id=self.appointment.pk,
            ):
                self.add_error("slot", "Selected slot is no longer available.")
            cleaned_data["slot_start"] = slot_start
            cleaned_data["slot_end"] = slot_end
        return cleaned_data

    def save(self, commit: bool = True):
        slot_start = self.cleaned_data.get("slot_start")
        slot_end = self.cleaned_data.get("slot_end")
        if slot_start is None or slot_end is None:
            raise forms.ValidationError("Unable to process the selected slot.")
        self.appointment.start = slot_start
        self.appointment.end = slot_end
        self.appointment.status = Appointment.STATUS_PENDING
        if commit:
            self.appointment.save()
        return self.appointment
