from django import template

register = template.Library()


@register.filter
def has_doctor_profile(user):
    """Return True if the user has an attached doctor profile."""
    try:
        return bool(getattr(user, "doctor_profile", None))
    except Exception:
        return False


@register.filter
def has_patient_profile(user):
    """Return True if the user has an attached patient profile."""
    try:
        return bool(getattr(user, "patient_profile", None))
    except Exception:
        return False
