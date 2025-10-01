from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications.services import NotificationService
from scheduling.models import Appointment
from notifications.models import Notification

REMINDER_WINDOWS = (
    ("24h", timedelta(hours=24)),
    ("2h", timedelta(hours=2)),
)


class Command(BaseCommand):
    help = "Send appointment reminders 24h and 2h before the visit."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Calculate reminders without dispatching notifications.",
        )
        parser.add_argument(
            "--window-minutes",
            type=int,
            default=15,
            help="Time window (in minutes) around the reminder offset to consider appointments.",
        )

    def handle(self, *args, **options):
        dry_run: bool = options.get("dry_run", False)
        window_minutes: int = options.get("window_minutes", 15)
        window = timedelta(minutes=window_minutes)
        now = timezone.now()
        service = NotificationService()
        total = 0

        for label, delta in REMINDER_WINDOWS:
            target_time = now + delta
            start = target_time - window
            end = target_time + window
            appointments = (
                Appointment.objects.filter(
                    start_datetime__gte=start,
                    start_datetime__lte=end,
                    status__in=["PENDING", "CONFIRMED"],
                )
                .select_related("patient", "doctor")
                .order_by("start_datetime")
            )
            for appointment in appointments:
                total += self._process_appointment(service, appointment, label, dry_run)

        if dry_run:
            self.stdout.write(self.style.WARNING(f"Dry run complete. {total} notifications would be sent."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Reminders sent: {total}"))

    def _process_appointment(self, service: NotificationService, appointment: Appointment, label: str, dry_run: bool) -> int:
        sent = 0
        patient_subject = f"[{label}] Appointment #{appointment.pk} reminder"
        doctor_subject = f"[{label}] Upcoming appointment #{appointment.pk}"
        doctor_name = self._display_name(appointment.doctor)
        patient_name = self._display_name(appointment.patient)
        when_local = timezone.localtime(appointment.start_datetime).strftime("%d %b %Y, %H:%M")
        patient_body = (
            f"Hi {patient_name},\n\n"
            f"This is a reminder for your appointment with Dr. {doctor_name} on {when_local}.\n"
            "Please arrive 10 minutes early or join the virtual session on time.\n\n"
            "- Mediko Care Team"
        )
        doctor_body = (
            f"Hello Dr. {doctor_name},\n\n"
            f"You have an upcoming appointment with {patient_name} on {when_local}.\n"
            "Review the patient's details ahead of time from your dashboard.\n\n"
            "- Mediko Care Team"
        )

        sent += self._send_if_needed(
            service,
            appointment.patient,
            patient_subject,
            patient_body,
            [Notification.CHANNEL_EMAIL, Notification.CHANNEL_IN_APP],
            dry_run,
        )
        sent += self._send_if_needed(
            service,
            appointment.doctor,
            doctor_subject,
            doctor_body,
            [Notification.CHANNEL_IN_APP],
            dry_run,
        )
        return sent

    def _send_if_needed(
        self,
        service: NotificationService,
        user,
        subject: str,
        body: str,
        channels,
        dry_run: bool,
    ) -> int:
        channels_to_send = [
            channel
            for channel in channels
            if not Notification.objects.filter(user=user, channel=channel, subject=subject).exists()
        ]
        if not channels_to_send:
            return 0
        if dry_run:
            return len(channels_to_send)
        service.send(user, subject, body, channels=channels_to_send)
        return len(channels_to_send)

    @staticmethod
    def _display_name(user) -> str:
        return user.get_full_name() or user.username or user.email or f"User {user.pk}"
