from datetime import datetime, time, timedelta

import pytest
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

from scheduling.models import Appointment, WorkingHours
from scheduling.services import AppointmentService


@pytest.mark.django_db
def test_booking_prevents_overlap(doctor_user, patient_user):
    today = timezone.localdate() + timedelta(days=1)
    WorkingHours.objects.create(
        doctor=doctor_user,
        day_of_week=today.weekday(),
        start_time=time(9, 0),
        end_time=time(17, 0),
    )
    start = timezone.make_aware(datetime.combine(today, time(10, 0)))
    Appointment.objects.create(
        doctor=doctor_user,
        patient=patient_user,
        start_datetime=start,
        end_datetime=start + timedelta(minutes=settings.APPOINTMENT_SLOT_MINUTES),
    )
    service = AppointmentService(patient_user, doctor_user)
    with pytest.raises(ValidationError):
        service.book(start, "PHYSICAL")


@pytest.mark.django_db
def test_reschedule_cutoff_enforced(doctor_user, patient_user):
    settings.APPOINTMENT_CANCEL_CUTOFF = timedelta(hours=2)
    target_day = timezone.localdate()
    WorkingHours.objects.create(
        doctor=doctor_user,
        day_of_week=target_day.weekday(),
        start_time=time(9, 0),
        end_time=time(17, 0),
    )
    start = timezone.now() + timedelta(hours=1)
    start = start.replace(minute=0, second=0, microsecond=0)
    appointment = Appointment.objects.create(
        doctor=doctor_user,
        patient=patient_user,
        start_datetime=start,
        end_datetime=start + timedelta(minutes=settings.APPOINTMENT_SLOT_MINUTES),
        status="CONFIRMED",
    )
    service = AppointmentService(patient_user, doctor_user)
    new_start = start + timedelta(hours=3)
    with pytest.raises(ValidationError):
        service.reschedule(appointment, new_start)
