from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Iterable, List, Sequence, Tuple

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone

from .models import ActivityLog, Appointment, DoctorProfile, WeeklyAvailability

User = get_user_model()

Slot = Tuple[datetime, datetime]

FROM_EMAIL = "no-reply@medbook.test"


def _get_doctor_profile(doctor: User | DoctorProfile) -> DoctorProfile | None:
    if isinstance(doctor, DoctorProfile):
        return doctor
    return getattr(doctor, "doctor_profile", None)


def generate_slots_for_doctor(
    doctor: User | DoctorProfile,
    start_date: date,
    weeks: int = 4,
    *,
    skip_past: bool = False,
) -> List[Slot]:
    profile = _get_doctor_profile(doctor)
    if not profile or not profile.is_active:
        return []
    if isinstance(start_date, datetime):
        start_date = start_date.date()
    tz = timezone.get_current_timezone()
    days = weeks * 7
    if days <= 0:
        days = 1
    availabilities: Sequence[WeeklyAvailability] = profile.availabilities.all()
    slots: List[Slot] = []
    now = timezone.now()
    for day_offset in range(days):
        day = start_date + timedelta(days=day_offset)
        weekday = day.weekday()
        for availability in availabilities:
            if availability.weekday != weekday:
                continue
            slot_length = availability.slot_length_minutes or profile.slot_length_minutes
            start_dt = timezone.make_aware(datetime.combine(day, availability.start_time), tz)
            end_of_window = timezone.make_aware(datetime.combine(day, availability.end_time), tz)
            current_start = start_dt
            while current_start + timedelta(minutes=slot_length) <= end_of_window:
                current_end = current_start + timedelta(minutes=slot_length)
                if skip_past and current_end <= now:
                    current_start = current_end
                    continue
                slots.append((current_start, current_end))
                current_start = current_end
    slots.sort()
    return slots


def is_slot_available(
    doctor: User | DoctorProfile,
    start: datetime,
    end: datetime,
    *,
    exclude_appointment_id: int | None = None,
) -> bool:
    profile = _get_doctor_profile(doctor)
    if not profile:
        return False
    doctor_user = profile.user
    if timezone.is_naive(start):
        start = timezone.make_aware(start, timezone.get_current_timezone())
    if timezone.is_naive(end):
        end = timezone.make_aware(end, timezone.get_current_timezone())
    conflicts = Appointment.objects.filter(
        doctor=doctor_user,
        status__in=[
            Appointment.STATUS_PENDING,
            Appointment.STATUS_APPROVED,
            Appointment.STATUS_COMPLETED,
        ],
    ).filter(start__lt=end, end__gt=start)
    if exclude_appointment_id:
        conflicts = conflicts.exclude(pk=exclude_appointment_id)
    return not conflicts.exists()


def notify_booking(appointment: Appointment) -> None:
    subject = "New appointment request"
    message = (
        f"Dear Dr. {appointment.doctor.get_full_name() or appointment.doctor.username},\n\n"
        f"{appointment.patient.get_full_name() or appointment.patient.username} has requested "
        f"an appointment on {timezone.localtime(appointment.start):%b %d, %I:%M %p}."
    )
    send_mail(subject, message, FROM_EMAIL, [appointment.doctor.email or FROM_EMAIL])


def notify_approval(appointment: Appointment) -> None:
    subject = "Appointment approved"
    message = (
        f"Hello {appointment.patient.get_full_name() or appointment.patient.username},\n\n"
        f"Your appointment with Dr. {appointment.doctor.get_full_name() or appointment.doctor.username} "
        f"on {timezone.localtime(appointment.start):%b %d, %I:%M %p} has been approved."
    )
    send_mail(subject, message, FROM_EMAIL, [appointment.patient.email or FROM_EMAIL])


def notify_decline(appointment: Appointment) -> None:
    subject = "Appointment declined"
    message = (
        f"Hello {appointment.patient.get_full_name() or appointment.patient.username},\n\n"
        f"Your appointment request with Dr. {appointment.doctor.get_full_name() or appointment.doctor.username} "
        f"was declined. Please choose another slot."
    )
    send_mail(subject, message, FROM_EMAIL, [appointment.patient.email or FROM_EMAIL])


def notify_cancel(appointment: Appointment) -> None:
    subject = "Appointment cancelled"
    message = (
        f"Appointment on {timezone.localtime(appointment.start):%b %d, %I:%M %p} has been cancelled."
    )
    recipients = [appointment.patient.email or FROM_EMAIL, appointment.doctor.email or FROM_EMAIL]
    send_mail(subject, message, FROM_EMAIL, recipients)


def notify_reschedule(appointment: Appointment) -> None:
    subject = "Appointment rescheduled"
    message = (
        f"The appointment has been moved to {timezone.localtime(appointment.start):%b %d, %I:%M %p}."
    )
    recipients = [appointment.patient.email or FROM_EMAIL, appointment.doctor.email or FROM_EMAIL]
    send_mail(subject, message, FROM_EMAIL, recipients)


def log_activity(actor: User | None, action: str, instance, extra: dict | None = None) -> ActivityLog:
    return ActivityLog.objects.create(
        actor=actor,
        action=action,
        model=instance.__class__.__name__,
        object_id=str(getattr(instance, "pk", "")),
        extra=extra or {},
    )
