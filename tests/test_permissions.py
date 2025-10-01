import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_patient_cannot_access_doctor_portal(client, patient_user):
    client.force_login(patient_user)
    response = client.get(reverse("doctor:dashboard"))
    assert response.status_code == 302
    assert reverse("accounts:login") in response.url


@pytest.mark.django_db
def test_doctor_cannot_access_patient_portal(client, doctor_user):
    client.force_login(doctor_user)
    response = client.get(reverse("patient:dashboard"))
    assert response.status_code == 302
    assert reverse("home") in response.url
