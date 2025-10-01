from django.db import migrations
from django.contrib.auth.hashers import make_password


def seed_users(apps, schema_editor):
    User = apps.get_model('tasks', 'User')

    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'password': make_password('admin123'),
        },
    )
    if not admin_user.is_staff or not admin_user.is_superuser:
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.role = 'admin'
        admin_user.password = make_password('admin123')
        admin_user.save()

    User.objects.get_or_create(
        username='john',
        defaults={
            'email': 'john@example.com',
            'role': 'user',
            'password': make_password('john123'),
        },
    )


def unseed_users(apps, schema_editor):
    User = apps.get_model('tasks', 'User')
    User.objects.filter(username__in=['admin', 'john']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_users, unseed_users),
    ]
