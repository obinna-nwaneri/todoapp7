from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .seed import ensure_seed_data


@receiver(post_migrate)
def populate_sample_data(sender, **kwargs):
    if sender.name != "appointments":
        return
    ensure_seed_data()
