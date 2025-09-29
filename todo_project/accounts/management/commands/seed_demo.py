from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tasks.models import Task


class Command(BaseCommand):
    help = 'Seed demo data for the Todo project.'

    def handle(self, *args, **options):
        User = get_user_model()

        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.set_password('admin')
        admin_user.save()
        self.stdout.write(self.style.SUCCESS('Admin user: admin / admin'))

        jane_user, _ = User.objects.get_or_create(
            username='jane',
            defaults={
                'email': 'jane@example.com',
                'is_staff': False,
            },
        )
        jane_user.is_staff = False
        jane_user.email = jane_user.email or 'jane@example.com'
        jane_user.set_password('password')
        jane_user.save()
        self.stdout.write(self.style.SUCCESS('Sample user: jane / password'))

        Task.objects.get_or_create(
            owner=jane_user,
            title='Buy groceries',
            defaults={
                'description': 'Milk, eggs, bread, and vegetables.',
                'due_date': date.today() + timedelta(days=2),
                'priority': 'medium',
                'status': 'pending',
            }
        )
        Task.objects.get_or_create(
            owner=jane_user,
            title='Prepare project report',
            defaults={
                'description': 'Summarize weekly progress and send to manager.',
                'due_date': date.today() + timedelta(days=5),
                'priority': 'high',
                'status': 'in_progress',
            }
        )
        self.stdout.write(self.style.SUCCESS('Demo tasks created for jane.'))
