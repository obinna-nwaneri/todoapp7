from __future__ import annotations

from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from tasks.models import Task


class Command(BaseCommand):
    help = "Seed the database with demo users and tasks."

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
            self.stdout.write(self.style.SUCCESS("Created admin user 'admin' with password 'admin'."))
        else:
            if not admin_user.check_password("admin"):
                admin_user.set_password("admin")
                admin_user.save()
            self.stdout.write("Admin user 'admin' already exists.")

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
            self.stdout.write(self.style.SUCCESS("Created demo user 'jane' with password 'password'."))
        else:
            if not jane_user.check_password("password"):
                jane_user.set_password("password")
                jane_user.save()
            self.stdout.write("Demo user 'jane' already exists.")

        Task.objects.get_or_create(
            owner=jane_user,
            title="Buy groceries",
            defaults={
                "description": "Milk, eggs, and bread.",
                "due_date": date.today() + timedelta(days=2),
                "priority": "medium",
                "status": "pending",
            },
        )
        Task.objects.get_or_create(
            owner=jane_user,
            title="Prepare presentation",
            defaults={
                "description": "Slides for Monday's meeting.",
                "due_date": date.today() + timedelta(days=5),
                "priority": "high",
                "status": "in_progress",
            },
        )

        self.stdout.write(self.style.SUCCESS("Seed data created. Credentials:"))
        self.stdout.write(" - Admin (staff & superuser): admin / admin")
        self.stdout.write(" - Demo user: jane / password")
