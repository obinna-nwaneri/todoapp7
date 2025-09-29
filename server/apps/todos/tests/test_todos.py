from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.todos.models import Task

User = get_user_model()


class TaskAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="Password123")
        self.other_user = User.objects.create_user(username="bob", password="Password123")
        login = self.client.post(reverse("token_obtain_pair"), {"username": "alice", "password": "Password123"})
        self.token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_create_list_update_delete_task(self):
        create_resp = self.client.post(
            reverse("task-list"),
            {
                "title": "Test Task",
                "description": "Details",
                "priority": "High",
                "status": "Pending",
            },
            format="json",
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        task_id = create_resp.data["id"]
        task = Task.objects.get(pk=task_id)
        self.assertEqual(task.owner, self.user)

        list_resp = self.client.get(reverse("task-list"))
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list_resp.data["count"], 1)

        detail_url = reverse("task-detail", args=[task_id])
        update_resp = self.client.patch(detail_url, {"status": "In Progress"}, format="json")
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, "In Progress")

        delete_resp = self.client.delete(detail_url)
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_user_cannot_access_others_tasks(self):
        task = Task.objects.create(owner=self.other_user, title="Other", priority="Low", status="Pending")
        resp = self.client.get(reverse("task-detail", args=[task.id]))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_filters(self):
        Task.objects.create(
            owner=self.user,
            title="Overdue",
            priority="Low",
            status="Pending",
            due_date=date.today() - timedelta(days=1),
        )
        Task.objects.create(
            owner=self.user,
            title="Today",
            priority="Medium",
            status="In Progress",
            due_date=date.today(),
        )
        overdue_resp = self.client.get(reverse("task-list"), {"due": "overdue"})
        self.assertEqual(overdue_resp.data["count"], 1)
        today_resp = self.client.get(reverse("task-list"), {"due": "today"})
        self.assertEqual(today_resp.data["count"], 1)
        status_resp = self.client.get(reverse("task-list"), {"status": "In Progress"})
        self.assertEqual(status_resp.data["count"], 1)
        search_resp = self.client.get(reverse("task-list"), {"search": "Over"})
        self.assertEqual(search_resp.data["count"], 1)
