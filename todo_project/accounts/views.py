from django import forms
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.contrib.auth.views import PasswordChangeView as DjangoPasswordChangeView
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.generic import FormView

from tasks.models import Task

from .forms import RegistrationForm


def staff_required(view_func):
    return login_required(user_passes_test(lambda u: u.is_staff)(view_func))


class RegisterView(FormView):
    template_name = 'accounts/register.html'
    form_class = RegistrationForm
    success_url = reverse_lazy('accounts:login')

    def form_valid(self, form):
        form.save()
        messages.success(self.request, 'Registration successful. You can now log in.')
        return super().form_valid(form)


@method_decorator(login_required, name='dispatch')
class ChangePasswordView(DjangoPasswordChangeView):
    success_url = reverse_lazy('tasks:dashboard')

    def form_valid(self, form):
        response = super().form_valid(form)
        update_session_auth_hash(self.request, form.user)
        messages.success(self.request, 'Your password was updated successfully.')
        return response


class StaffUserForm(forms.ModelForm):
    role = forms.ChoiceField(choices=[('False', 'Frontend User'), ('True', 'Admin / Staff')], label='Role')
    password = forms.CharField(required=False, widget=forms.PasswordInput, label='Password')
    password_confirm = forms.CharField(required=False, widget=forms.PasswordInput, label='Confirm Password')

    class Meta:
        model = User
        fields = ['username', 'email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['role'].initial = 'True' if self.instance.is_staff else 'False'
        else:
            self.fields['role'].initial = 'False'

    def clean_email(self):
        email = self.cleaned_data.get('email')
        qs = User.objects.filter(email__iexact=email)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise forms.ValidationError('A user with that email already exists.')
        return email

    def clean_role(self):
        return self.cleaned_data.get('role') == 'True'

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        if password or password_confirm:
            if password != password_confirm:
                raise forms.ValidationError('Passwords do not match.')
            if not password:
                raise forms.ValidationError('Password cannot be empty when setting a new password.')
        return cleaned_data


class StaffTaskForm(forms.ModelForm):
    owner = forms.ModelChoiceField(queryset=User.objects.order_by('username'), label='Owner')

    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'priority', 'status', 'owner']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'required': 'required'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'due_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['owner'].widget.attrs.update({'class': 'form-select'})


@staff_required
def staff_user_list(request):
    query = request.GET.get('q', '')
    users = User.objects.all().order_by('username')
    if query:
        users = users.filter(Q(username__icontains=query) | Q(email__icontains=query))
    context = {
        'users': users,
        'query': query,
    }
    return render(request, 'accounts/staff_user_list.html', context)


@staff_required
def staff_user_create(request):
    if request.method == 'POST':
        form = StaffUserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = form.cleaned_data['role']
            password = form.cleaned_data.get('password')
            if password:
                user.set_password(password)
            else:
                user.set_unusable_password()
            user.save()
            messages.success(request, 'User created successfully.')
            return redirect('staff:staff_users')
    else:
        form = StaffUserForm()
    return render(request, 'accounts/staff_user_form.html', {'form': form, 'is_create': True})


@staff_required
def staff_user_edit(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        form = StaffUserForm(request.POST, instance=user)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = form.cleaned_data['role']
            password = form.cleaned_data.get('password')
            if password:
                user.set_password(password)
            user.save()
            messages.success(request, 'User updated successfully.')
            return redirect('staff:staff_users')
    else:
        form = StaffUserForm(instance=user)
    return render(request, 'accounts/staff_user_form.html', {'form': form, 'is_create': False, 'edit_user': user})


@staff_required
def staff_user_delete(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == 'POST':
        if user == request.user:
            messages.error(request, 'You cannot delete your own account.')
        else:
            user.delete()
            messages.success(request, 'User deleted successfully.')
        return redirect('staff:staff_users')
    return render(request, 'accounts/staff_user_form.html', {'delete_user': user})


@staff_required
def staff_task_list(request):
    tasks = Task.objects.select_related('owner').all().order_by('-created_at')
    user_filter = request.GET.get('user', '')
    status_filter = request.GET.get('status', '')
    priority_filter = request.GET.get('priority', '')
    search_query = request.GET.get('q', '')

    if user_filter:
        tasks = tasks.filter(owner__id=user_filter)
    if status_filter:
        tasks = tasks.filter(status=status_filter)
    if priority_filter:
        tasks = tasks.filter(priority=priority_filter)
    if search_query:
        tasks = tasks.filter(title__icontains=search_query)

    users = User.objects.order_by('username')

    context = {
        'tasks': tasks,
        'users': users,
        'user_filter': user_filter,
        'status_filter': status_filter,
        'priority_filter': priority_filter,
        'search_query': search_query,
    }
    return render(request, 'accounts/staff_task_list.html', context)


@staff_required
def staff_task_edit(request, pk):
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        form = StaffTaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            messages.success(request, 'Task updated successfully.')
            return redirect('staff:staff_tasks')
    else:
        form = StaffTaskForm(instance=task)
    return render(request, 'accounts/staff_task_form.html', {'form': form, 'task': task})


@staff_required
def staff_task_delete(request, pk):
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        task.delete()
        messages.success(request, 'Task deleted successfully.')
        return redirect('staff:staff_tasks')
    return render(request, 'accounts/staff_task_form.html', {'delete_task': task})
