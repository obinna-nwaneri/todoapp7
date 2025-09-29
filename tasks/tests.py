from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Task


class TaskSecurityTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="alice", password="pass12345")
        self.other = get_user_model().objects.create_user(username="bob", password="pass12345")
        self.task = Task.objects.create(
            user=self.user,
            title="Private task",
            description="Top secret",
        )

    def test_user_cannot_view_another_users_task(self):
        self.client.login(username=self.other.username, password="pass12345")
        response = self.client.get(reverse("tasks:detail", args=[self.task.pk]))
        self.assertEqual(response.status_code, 404)

    def test_task_creation_assigns_logged_in_user(self):
        self.client.login(username="alice", password="pass12345")
        payload = {
            "title": "New task",
            "description": "",
            "due_date": "",
            "priority": Task.PRIORITY_HIGH,
            "status": Task.STATUS_PENDING,
        }
        response = self.client.post(reverse("tasks:create"), payload)
        self.assertEqual(response.status_code, 302)
        created = Task.objects.get(title="New task")
        self.assertEqual(created.user, self.user)


class AuthenticationFlowTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="charlie", password="oldpass123")

    def test_logout_redirects_to_home(self):
        self.client.login(username="charlie", password="oldpass123")
        response = self.client.get(reverse("accounts:logout"))
        self.assertRedirects(response, reverse("home"))

    def test_password_change_updates_credentials(self):
        self.client.login(username="charlie", password="oldpass123")
        response = self.client.post(
            reverse("accounts:password_change"),
            {
                "old_password": "oldpass123",
                "new_password1": "newpass456",
                "new_password2": "newpass456",
            },
        )
        self.assertRedirects(response, reverse("accounts:password_change_done"))
        self.client.logout()
        login_success = self.client.login(username="charlie", password="newpass456")
        self.assertTrue(login_success)
