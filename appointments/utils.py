from django.contrib.auth.models import Group

from accounts.views import ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT


def ensure_group(name: str) -> Group:
    group, _ = Group.objects.get_or_create(name=name)
    return group


def assign_role(user, role_name: str):
    group = ensure_group(role_name)
    user.groups.add(group)


def remove_role(user, role_name: str):
    group = Group.objects.filter(name=role_name).first()
    if group:
        user.groups.remove(group)
