from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = ('email', 'role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'password1', 'password2', 'role')}),
    )
    search_fields = ('email',)
    filter_horizontal = ('groups', 'user_permissions')
    list_filter = ('role', 'is_staff')
    readonly_fields = ('date_joined',)
    model = User
    ordering = ('email',)
    def get_queryset(self, request):
        return super().get_queryset(request)

    def get_fieldsets(self, request, obj=None):
        return super().get_fieldsets(request, obj)
