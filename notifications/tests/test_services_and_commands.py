from __future__ import annotations

from datetime import timedelta
from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from notifications.models import Notification
from notifications.services import NotificationService
from scheduling.models import Appointment


class NotificationServiceTests(TestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            username="notify-user",
            email="notify@example.com",
            phone="08012345678",
            password="testpass",
        )

    def test_send_creates_records_for_each_channel(self) -> None:
        email_log: list[tuple] = []
        sms_log: list[tuple] = []

        def fake_email(subject, body, from_email, to_list):
            email_log.append((subject, body, from_email, tuple(to_list)))

        def fake_sms(phone, body):
            sms_log.append((phone, body))

        service = NotificationService(email_sender=fake_email, sms_sender=fake_sms)
        service.send(
            self.user,
            "Test subject",
            "Hello world",
            channels=[
                Notification.CHANNEL_EMAIL,
                Notification.CHANNEL_SMS,
                Notification.CHANNEL_IN_APP,
            ],
        )

        notifications = Notification.objects.filter(user=self.user).order_by("channel")
        self.assertEqual(notifications.count(), 3)
        self.assertTrue(all(item.sent_at is not None for item in notifications))
        self.assertTrue(all(item.read_at is None for item in notifications))
        self.assertEqual(email_log[0][0], "Test subject")
        self.assertEqual(sms_log[0][0], "08012345678")


class SendRemindersCommandTests(TestCase):
    def setUp(self) -> None:
        self.patient = User.objects.create_user(
            username="patient",
            email="patient@example.com",
            password="pass12345",
        )
        self.doctor = User.objects.create_user(
            username="doctor",
            email="doctor@example.com",
            password="pass12345",
        )
        start = timezone.now() + timedelta(hours=24)
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            start_datetime=start,
            end_datetime=start + timedelta(minutes=30),
            status="CONFIRMED",
            type="PHYSICAL",
        )

    def test_command_sends_and_does_not_duplicate(self) -> None:
        output = StringIO()
        call_command("send_reminders", "--dry-run", stdout=output)
        self.assertIn("Dry run complete", output.getvalue())
        self.assertEqual(Notification.objects.count(), 0)

        call_command("send_reminders")
        self.assertEqual(Notification.objects.count(), 3)

        call_command("send_reminders")
        self.assertEqual(Notification.objects.count(), 3)
