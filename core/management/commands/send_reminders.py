from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from core.utils import send_notification


class Command(BaseCommand):
    help = "Send reminders for upcoming approved appointments"

    def handle(self, *args, **options):
        now = timezone.now()
        windows = [timedelta(hours=24), timedelta(hours=2)]
        for window in windows:
            start = now + window
            appointments = Appointment.objects.filter(
                status=Appointment.Status.APPROVED,
                start_at__gte=start - timedelta(minutes=5),
                start_at__lte=start + timedelta(minutes=5),
            )
            for appointment in appointments:
                message = f"Reminder: appointment on {appointment.start_at} with {appointment.doctor.name}."
                send_notification([appointment.patient.user.email], "Appointment reminder", message)
                send_notification([appointment.doctor.user.email], "Appointment reminder", message)
                self.stdout.write(f"Sent reminder for appointment {appointment.id}")
