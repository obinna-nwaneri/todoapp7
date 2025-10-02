from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from core.utils import get_reminder_hours, notify_user


class Command(BaseCommand):
    help = "Send appointment reminders"

    def handle(self, *args, **options):
        hours_list = get_reminder_hours()
        now = timezone.now()
        for hours in hours_list:
            window_start = now + timedelta(hours=hours)
            window_end = window_start + timedelta(minutes=5)
            appointments = Appointment.objects.filter(
                status=Appointment.Status.APPROVED,
                start_at__gte=window_start,
                start_at__lte=window_end,
            )
            for appointment in appointments:
                subject = "Appointment Reminder"
                message = (
                    f"Reminder: Appointment with Dr. {appointment.doctor.name} at "
                    f"{appointment.start_at.astimezone().strftime('%Y-%m-%d %H:%M')}"
                )
                notify_user(appointment.patient.user, subject, message)
                notify_user(appointment.doctor.user, subject, message)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Sent reminder for appointment {appointment.pk} ({hours}h before)"
                    )
                )
