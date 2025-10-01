from datetime import datetime, time, timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from scheduling.models import WorkingHours


@pytest.mark.django_db
def test_doctor_availability_htmx(client, doctor_user):
    target_day = timezone.localdate() + timedelta(days=1)
    WorkingHours.objects.create(
        doctor=doctor_user,
        day_of_week=target_day.weekday(),
        start_time=time(9, 0),
        end_time=time(12, 0),
    )
    url = reverse("directory:doctor_availability", args=[doctor_user.doctorprofile.pk])
    response = client.get(
        url,
        {"date": target_day.strftime("%Y-%m-%d")},
        HTTP_HX_REQUEST="true",
    )
    assert response.status_code == 200
    body = response.content.decode()
    assert "No available slots" not in body
    assert target_day.strftime("%d %b") in body
