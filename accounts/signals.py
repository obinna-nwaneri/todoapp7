from __future__ import annotations

from django.contrib.auth.models import Group, Permission
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver

from .models import PatientProfile, User


ROLE_PERMISSIONS = {
    User.ROLE_PATIENT: [],
    User.ROLE_DOCTOR: [
        "view_appointment",
        "change_appointment",
        "view_prescription",
        "add_prescription",
    ],
    User.ROLE_ADMIN: [],
}


@receiver(post_save, sender=User)
def create_patient_profile(sender, instance: User, created: bool, **_: object) -> None:
    if not created:
        return
    if instance.preferred_role == User.ROLE_PATIENT:
        PatientProfile.objects.get_or_create(user=instance)
    elif instance.preferred_role == User.ROLE_DOCTOR:
        # doctor profiles are created during registration workflow
        group = Group.objects.get(name=User.ROLE_DOCTOR)
        instance.groups.add(group)


@receiver(post_migrate)
def ensure_groups(sender, app_config, **_: object) -> None:  # pragma: no cover
    if app_config.name != "accounts":
        return
    for role, perms in ROLE_PERMISSIONS.items():
        group, _ = Group.objects.get_or_create(name=role)
        group.permissions.clear()
        for perm_codename in perms:
            perm = Permission.objects.filter(codename=perm_codename).first()
            if perm:
                group.permissions.add(perm)

    admin_group, _ = Group.objects.get_or_create(name=User.ROLE_ADMIN)
    admin_group.permissions.set(Permission.objects.all())


