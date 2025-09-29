from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def test_register_and_login(self):
        register_url = reverse("register")
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPass123",
            "password2": "StrongPass123",
        }
        response = self.client.post(register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())

        login_url = reverse("token_obtain_pair")
        response = self.client.post(login_url, {"username": "testuser", "password": "StrongPass123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_change_password(self):
        user = User.objects.create_user(username="user", password="OldPass123")
        login_url = reverse("token_obtain_pair")
        login_response = self.client.post(login_url, {"username": "user", "password": "OldPass123"})
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        change_url = reverse("change_password")
        response = self.client.put(
            change_url,
            {
                "old_password": "OldPass123",
                "new_password": "NewPass456",
                "new_password_confirm": "NewPass456",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass456"))

    def test_change_password_invalid_old(self):
        user = User.objects.create_user(username="user", password="OldPass123")
        login_url = reverse("token_obtain_pair")
        login_response = self.client.post(login_url, {"username": "user", "password": "OldPass123"})
        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        change_url = reverse("change_password")
        response = self.client.put(
            change_url,
            {
                "old_password": "WrongPass",
                "new_password": "NewPass456",
                "new_password_confirm": "NewPass456",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertTrue(user.check_password("OldPass123"))
