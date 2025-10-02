from functools import wraps

from django.contrib import messages
from django.contrib.auth import logout
from django.shortcuts import redirect

from accounts.views import ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT


def role_required(role):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect("login")
            user = request.user
            has_role = False
            if role == ROLE_ADMIN:
                has_role = user.is_superuser or user.groups.filter(name=ROLE_ADMIN).exists()
            else:
                has_role = user.groups.filter(name=role).exists()
            if not has_role:
                messages.error(request, "You do not have access to that area.")
                logout(request)
                return redirect("login")
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator
