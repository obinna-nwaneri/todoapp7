import pytest
from django.contrib.auth.models import Group

from accounts.models import DoctorProfile, PatientProfile, User
from directory.models import Specialty


@pytest.fixture
def specialty(db):
    return Specialty.objects.create(name="General Medicine", description="Primary care")


@pytest.fixture
def doctor_user(db, specialty):
    doctor = User.objects.create_user(
        username="doctor_test",
        email="doctor_test@example.com",
        password="Doctor@123",
        preferred_role=User.ROLE_DOCTOR,
        is_active=True,
    )
    Group.objects.get_or_create(name=User.ROLE_DOCTOR)
    doctor.groups.add(Group.objects.get(name=User.ROLE_DOCTOR))
    DoctorProfile.objects.create(
        user=doctor,
        specialty=specialty,
        years_experience=10,
        location="Lekki",
        fee=20000,
        bio="Test doctor",
        verified=True,
    )
    return doctor


@pytest.fixture
def patient_user(db):
    patient = User.objects.create_user(
        username="patient_test",
        email="patient_test@example.com",
        password="Patient@123",
        preferred_role=User.ROLE_PATIENT,
    )
    Group.objects.get_or_create(name=User.ROLE_PATIENT)
    patient.groups.add(Group.objects.get(name=User.ROLE_PATIENT))
    return patient
