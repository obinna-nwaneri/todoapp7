from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tasks.models import Task


class Command(BaseCommand):
    help = "Seed the database with sample users and tasks."

    def handle(self, *args, **options):
        User = get_user_model()

        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com"},
        )
        if not admin_user.is_staff:
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password("adminpass123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user 'admin'."))

        user1, created = User.objects.get_or_create(
            username="jane",
            defaults={"email": "jane@example.com"},
        )
        if created:
            user1.set_password("janepass123")
            user1.save()
            self.stdout.write(self.style.SUCCESS("Created user 'jane'."))

        user2, created = User.objects.get_or_create(
            username="mike",
            defaults={"email": "mike@example.com"},
        )
        if created:
            user2.set_password("mikepass123")
            user2.save()
            self.stdout.write(self.style.SUCCESS("Created user 'mike'."))

        tasks_data = [
            {
                "title": "Plan sprint backlog",
                "description": "Organize tasks for upcoming sprint.",
                "due_date": date.today() + timedelta(days=3),
                "priority": Task.Priority.HIGH,
                "status": Task.Status.IN_PROGRESS,
                "user": admin_user,
            },
            {
                "title": "Write project proposal",
                "description": "Draft initial project requirements.",
                "due_date": date.today() + timedelta(days=7),
                "priority": Task.Priority.MEDIUM,
                "status": Task.Status.PENDING,
                "user": user1,
            },
            {
                "title": "Review code submissions",
                "description": "Peer review latest merge requests.",
                "due_date": date.today() + timedelta(days=2),
                "priority": Task.Priority.HIGH,
                "status": Task.Status.PENDING,
                "user": user2,
            },
            {
                "title": "Update documentation",
                "description": "Add API docs for new endpoints.",
                "due_date": date.today() + timedelta(days=5),
                "priority": Task.Priority.MEDIUM,
                "status": Task.Status.IN_PROGRESS,
                "user": user1,
            },
            {
                "title": "Prepare release notes",
                "description": "Summarize changes for release v1.2.",
                "due_date": date.today() + timedelta(days=1),
                "priority": Task.Priority.HIGH,
                "status": Task.Status.PENDING,
                "user": admin_user,
            },
            {
                "title": "Fix login bug",
                "description": "Resolve issue with password reset flow.",
                "due_date": date.today() + timedelta(days=4),
                "priority": Task.Priority.HIGH,
                "status": Task.Status.IN_PROGRESS,
                "user": user2,
            },
            {
                "title": "Design dashboard UI",
                "description": "Create wireframes for dashboard.",
                "due_date": date.today() + timedelta(days=10),
                "priority": Task.Priority.MEDIUM,
                "status": Task.Status.PENDING,
                "user": user1,
            },
            {
                "title": "Conduct user interviews",
                "description": "Schedule and run interviews with users.",
                "due_date": date.today() + timedelta(days=14),
                "priority": Task.Priority.LOW,
                "status": Task.Status.PENDING,
                "user": user2,
            },
            {
                "title": "Deploy staging environment",
                "description": "Push latest build to staging server.",
                "due_date": date.today() + timedelta(days=6),
                "priority": Task.Priority.MEDIUM,
                "status": Task.Status.IN_PROGRESS,
                "user": admin_user,
            },
            {
                "title": "Close completed tasks",
                "description": "Archive tasks marked as done.",
                "due_date": None,
                "priority": Task.Priority.LOW,
                "status": Task.Status.COMPLETED,
                "user": user1,
            },
        ]

        created_count = 0
        for task_data in tasks_data:
            task, created = Task.objects.get_or_create(
                title=task_data["title"],
                user=task_data["user"],
                defaults=task_data,
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Seed complete. Created {created_count} new task(s).")
        )
