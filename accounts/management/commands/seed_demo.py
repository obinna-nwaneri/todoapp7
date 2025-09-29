from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tasks.models import Task

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo users and tasks"

    def handle(self, *args, **options):
        admin_user, created_admin = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created_admin:
            admin_user.set_password("admin")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (admin/admin)"))
        else:
            self.stdout.write("Admin user already exists")

        jane, created_jane = User.objects.get_or_create(
            username="jane",
            defaults={
                "email": "jane@example.com",
                "is_staff": False,
            },
        )
        if created_jane:
            jane.set_password("password")
            jane.save()
            self.stdout.write(self.style.SUCCESS("Created demo user (jane/password)"))
        else:
            self.stdout.write("Demo user jane already exists")

        Task.objects.get_or_create(
            owner=jane,
            title="Plan product roadmap",
            defaults={
                "description": "Outline milestones for the next quarter.",
                "due_date": date.today() + timedelta(days=7),
                "priority": "high",
                "status": "in_progress",
            },
        )
        Task.objects.get_or_create(
            owner=jane,
            title="Schedule design review",
            defaults={
                "description": "Coordinate with design team for feedback.",
                "due_date": date.today() + timedelta(days=3),
                "priority": "medium",
                "status": "pending",
            },
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        self.stdout.write("Credentials:\n  Admin: admin / admin\n  User : jane / password")
