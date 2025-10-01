from django.db import migrations


def create_sample_users(apps, schema_editor):
    User = apps.get_model('tasks', 'User')
    if not User.objects.filter(username='admin').exists():
        admin_user = User(username='admin', email='admin@example.com', role='admin', is_staff=True, is_superuser=True)
        admin_user.set_password('admin123')
        admin_user.save()
    if not User.objects.filter(username='john').exists():
        john_user = User(username='john', email='john@example.com', role='user')
        john_user.set_password('john123')
        john_user.save()


def delete_sample_users(apps, schema_editor):
    User = apps.get_model('tasks', 'User')
    User.objects.filter(username__in=['admin', 'john']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_sample_users, delete_sample_users),
    ]
