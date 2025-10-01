from datetime import datetime, time, timedelta

import pytest
from django.utils import timezone

from scheduling.models import TimeOff, WorkingHours
from scheduling.services import AvailabilityService


@pytest.mark.django_db
def test_time_off_blocks_slots(doctor_user):
    target_day = timezone.localdate() + timedelta(days=2)
    WorkingHours.objects.create(
        doctor=doctor_user,
        day_of_week=target_day.weekday(),
        start_time=time(9, 0),
        end_time=time(12, 0),
    )
    start_off = timezone.make_aware(datetime.combine(target_day, time(10, 0)))
    TimeOff.objects.create(
        doctor=doctor_user,
        start_datetime=start_off,
        end_datetime=start_off + timedelta(hours=1),
        reason="Break",
    )
    service = AvailabilityService(doctor_user)
    slots = service.generate_slots(start_off)
    assert all(not (slot.start >= start_off and slot.start < start_off + timedelta(hours=1)) for slot in slots)
