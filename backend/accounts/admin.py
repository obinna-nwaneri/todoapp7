from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "first_name", "last_name", "is_staff")
    ordering = ("email",)
    fieldsets = UserAdmin.fieldsets
    add_fieldsets = UserAdmin.add_fieldsets
    search_fields = ("email",)

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj is None:
            return fieldsets
        return fieldsets
