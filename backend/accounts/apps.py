from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"

    def ready(self):
        from django.contrib.auth import get_user_model
        from django.db.models.signals import post_migrate

        User = get_user_model()

        def create_seed_data(sender, **kwargs):
            if not User.objects.filter(username="admin").exists():
                User.objects.create_superuser(
                    username="admin",
                    email="admin@example.com",
                    password="Admin@123",
                )
            if not User.objects.filter(username="johndoe").exists():
                User.objects.create_user(
                    username="johndoe",
                    email="johndoe@example.com",
                    password="User@123",
                )

        post_migrate.connect(create_seed_data, sender=self)
