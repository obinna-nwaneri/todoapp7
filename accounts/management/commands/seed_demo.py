from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from tasks.models import Task


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
        else:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password("admin")
            admin_user.save()

        jane_user, created_jane = User.objects.get_or_create(
            username="jane",
            defaults={
                "email": "jane@example.com",
                "is_staff": False,
            },
        )
        if created_jane:
            jane_user.set_password("password")
            jane_user.save()
        else:
            jane_user.is_staff = False
            jane_user.set_password("password")
            jane_user.email = "jane@example.com"
            jane_user.save()

        Task.objects.filter(owner=jane_user).delete()

        Task.objects.create(
            owner=jane_user,
            title="Prepare project brief",
            description="Outline project goals and deliverables.",
            due_date=date.today() + timedelta(days=3),
            priority="high",
            status="in_progress",
        )
        Task.objects.create(
            owner=jane_user,
            title="Book team meeting",
            description="Schedule kickoff meeting with stakeholders.",
            due_date=date.today() + timedelta(days=7),
            priority="medium",
            status="pending",
        )

        self.stdout.write(self.style.SUCCESS("Demo data created."))
        self.stdout.write("Admin: admin / admin")
        self.stdout.write("User : jane / password")
