from __future__ import annotations

from datetime import datetime, timedelta

from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm, UserCreationForm
from django.utils import timezone

from .models import Appointment, DoctorProfile, PatientProfile, WeeklyAvailability
from .services import generate_slots_for_doctor, is_slot_available

User = get_user_model()


class TailwindFormMixin:
    """Mixin to apply Tailwind-friendly classes to form widgets."""

    input_css_class = "mt-1 w-full border border-gray-300 rounded px-3 py-2"
    checkbox_css_class = "h-4 w-4 text-indigo-600 border-gray-300 rounded"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            widget = field.widget
            if isinstance(widget, forms.CheckboxInput):
                css_class = self.checkbox_css_class
            else:
                css_class = self.input_css_class
            existing = widget.attrs.get("class", "").strip()
            widget.attrs["class"] = (f"{existing} {css_class}" if existing else css_class).strip()


class TailwindAuthenticationForm(TailwindFormMixin, AuthenticationForm):
    pass


class TailwindPasswordChangeForm(TailwindFormMixin, PasswordChangeForm):
    pass


class DoctorChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        profile = getattr(obj, "doctor_profile", None)
        if profile:
            parts = [f"Dr. {profile.full_name}"]
            if profile.specialty:
                parts.append(profile.specialty.name)
            if profile.clinic:
                parts.append(profile.clinic.city)
            return " • ".join(parts)
        return obj.get_full_name() or obj.username

    def clean(self, value):
        try:
            return super().clean(value)
        except forms.ValidationError as exc:
            if value in self.empty_values:
                raise
            try:
                profile = DoctorProfile.objects.select_related("user").get(
                    pk=value, is_active=True
                )
            except DoctorProfile.DoesNotExist:
                raise exc
            if profile.user not in self.queryset:
                raise exc
            return profile.user


class UserRegistrationForm(TailwindFormMixin, UserCreationForm):
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


class PatientProfileForm(TailwindFormMixin, forms.ModelForm):
    class Meta:
        model = PatientProfile
        fields = ("phone", "dob", "gender", "address")
        widgets = {
            "dob": forms.DateInput(attrs={"type": "date"}),
        }


class DoctorProfileForm(TailwindFormMixin, forms.ModelForm):
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


class AvailabilityForm(TailwindFormMixin, forms.ModelForm):
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


class AppointmentRequestForm(TailwindFormMixin, forms.ModelForm):
    doctor = DoctorChoiceField(
        queryset=User.objects.filter(doctor_profile__is_active=True)
        .select_related("doctor_profile", "doctor_profile__specialty", "doctor_profile__clinic"),
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

    def __init__(self, *args, patient: User, request=None, **kwargs):
        self.patient = patient
        self.request = request
        super().__init__(*args, **kwargs)
        if self.request:
            hx_attrs = {
                "hx-get": self.request.path,
                "hx-trigger": "change",
                "hx-target": "#slot-container",
                "hx-include": "[name='doctor'], [name='date']",
                "hx-indicator": ".loading-indicator",
            }
            for field_name in ("doctor", "date"):
                self.fields[field_name].widget.attrs.update(hx_attrs)
        self.fields["slot"].choices = []
        if "doctor" in self.data and "date" in self.data:
            self._populate_slot_choices_from_data()
        elif self.initial.get("doctor") and self.initial.get("date"):
            self._populate_slot_choices(
                self.initial["doctor"],
                self.initial["date"],
            )

    def _resolve_doctor_user(self, value):
        if isinstance(value, User):
            return value
        queryset = self.fields["doctor"].queryset
        user = queryset.filter(pk=value).first()
        if user:
            return user
        try:
            profile = DoctorProfile.objects.select_related("user").get(
                pk=value, is_active=True
            )
        except DoctorProfile.DoesNotExist:
            return None
        return profile.user if profile.user in queryset else None

    def _populate_slot_choices_from_data(self):
        try:
            doctor_id = int(self.data.get("doctor"))
            doctor_user = self._resolve_doctor_user(doctor_id)
            doctor_profile = getattr(doctor_user, "doctor_profile", None)
            date_value = self.fields["date"].to_python(self.data.get("date"))
            if date_value:
                self._populate_slot_choices(doctor_user, date_value)
        except (TypeError, ValueError):
            pass

    def _populate_slot_choices(self, doctor, date_value):
        if isinstance(doctor, (int, str)):
            doctor = self._resolve_doctor_user(doctor)
        if isinstance(date_value, str):
            date_value = self.fields["date"].to_python(date_value)
        if not doctor or not date_value:
            return
        profile = getattr(doctor, "doctor_profile", None)
        if not profile or not profile.is_active:
            return
        slots = generate_slots_for_doctor(
            doctor,
            date_value,
            weeks=0,
            skip_past=True,
        )
        same_day_slots = [
            slot for slot in slots if timezone.localdate(slot[0]) == date_value
        ]
        valid_slots = []
        now = timezone.now()
        for start, end in same_day_slots:
            if start is None or end is None:
                continue
            if start < now:
                continue
            if not is_slot_available(doctor, start, end):
                continue
            valid_slots.append((start, end))
        choices = [
            (
                start.isoformat(),
                f"{timezone.localtime(start):%I:%M %p} - {timezone.localtime(end):%I:%M %p}",
            )
            for start, end in valid_slots
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
        doctor_user: User | None = cleaned_data.get("doctor")
        slot_start: datetime | None = cleaned_data.get("slot")
        if doctor_user and slot_start:
            doctor_profile = getattr(doctor_user, "doctor_profile", None)
            if not doctor_profile:
                self.add_error("doctor", "Selected doctor is unavailable.")
                return cleaned_data
            if timezone.is_naive(slot_start):
                slot_start = timezone.make_aware(slot_start, timezone.get_current_timezone())
            slot_end = slot_start + timedelta(minutes=doctor_profile.slot_length_minutes)
            if not is_slot_available(doctor_user, slot_start, slot_end):
                self.add_error("slot", "Selected slot is no longer available.")
            cleaned_data["slot_start"] = slot_start
            cleaned_data["slot_end"] = slot_end
            cleaned_data["doctor_profile"] = doctor_profile
            cleaned_data["doctor"] = doctor_user
            self.instance.start = slot_start
            self.instance.end = slot_end
            self.instance.doctor = doctor_user
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


class AppointmentRescheduleForm(TailwindFormMixin, forms.ModelForm):
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
