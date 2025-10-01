from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable, List

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from accounts.models import User

from .models import Appointment, TimeOff, WorkingHours


@dataclass
class Slot:
    start: datetime
    end: datetime

    @property
    def label(self) -> str:
        return timezone.localtime(self.start).strftime("%d %b %Y %H:%M")


class AvailabilityService:
    def __init__(self, doctor: User):
        self.doctor = doctor

    def working_hours(self, target_date: datetime) -> Iterable[WorkingHours]:
        weekday = target_date.weekday()
        return self.doctor.working_hours.filter(day_of_week=weekday)

    def time_off(self, start: datetime, end: datetime) -> Iterable[TimeOff]:
        return self.doctor.time_off.filter(start_datetime__lt=end, end_datetime__gt=start)

    def generate_slots(self, target_date: datetime) -> List[Slot]:
        slots: List[Slot] = []
        slot_length = timedelta(minutes=settings.APPOINTMENT_SLOT_MINUTES)
        existing = Appointment.objects.filter(
            doctor=self.doctor,
            start_datetime__date=target_date.date(),
        )
        taken_ranges = [
            (appt.start_datetime, appt.end_datetime) for appt in existing
        ]
        for wh in self.working_hours(target_date):
            start_dt = timezone.make_aware(datetime.combine(target_date.date(), wh.start_time))
            end_dt = timezone.make_aware(datetime.combine(target_date.date(), wh.end_time))
            cursor = start_dt
            while cursor + slot_length <= end_dt:
                candidate = Slot(start=cursor, end=cursor + slot_length)
                if not self._is_blocked(candidate, taken_ranges):
                    slots.append(candidate)
                cursor += slot_length
        return slots

    def _is_blocked(self, slot: Slot, taken_ranges: Iterable[tuple[datetime, datetime]]) -> bool:
        # Doctor time off
        if self.time_off(slot.start, slot.end).exists():
            return True
        for start, end in taken_ranges:
            if start < slot.end and end > slot.start:
                return True
        return slot.start < timezone.now()

    def upcoming_slots(self, limit: int = 10) -> List[Slot]:
        results: List[Slot] = []
        current = timezone.localtime()
        days_ahead = 30
        for day_offset in range(days_ahead):
            target_date = current + timedelta(days=day_offset)
            slots = [slot for slot in self.generate_slots(target_date) if slot.start >= current]
            results.extend(slots)
            if len(results) >= limit:
                return results[:limit]
        return results


class AppointmentService:
    def __init__(self, patient: User, doctor: User):
        self.patient = patient
        self.doctor = doctor

    def book(self, start: datetime, appointment_type: str, reason: str = "") -> Appointment:
        slot_length = timedelta(minutes=settings.APPOINTMENT_SLOT_MINUTES)
        end = start + slot_length
        availability = AvailabilityService(self.doctor)
        valid_slots = availability.generate_slots(start)
        if not any(abs((slot.start - start).total_seconds()) < 60 for slot in valid_slots):
            raise ValidationError("Selected slot is no longer available")
        with transaction.atomic():
            appointment = Appointment.objects.create(
                patient=self.patient,
                doctor=self.doctor,
                start_datetime=start,
                end_datetime=end,
                type=appointment_type,
                reason_text=reason,
            )
        return appointment

    def reschedule(self, appointment: Appointment, new_start: datetime) -> Appointment:
        if appointment.patient != self.patient:
            raise ValidationError("You cannot reschedule this appointment")
        if not appointment.can_cancel():
            raise ValidationError("Reschedule window has passed")
        slot_length = timedelta(minutes=settings.APPOINTMENT_SLOT_MINUTES)
        availability = AvailabilityService(appointment.doctor)
        valid_slots = availability.generate_slots(new_start)
        if not any(abs((slot.start - new_start).total_seconds()) < 60 for slot in valid_slots):
            raise ValidationError("Slot unavailable")
        appointment.start_datetime = new_start
        appointment.end_datetime = new_start + slot_length
        appointment.status = "PENDING"
        appointment.save(update_fields=["start_datetime", "end_datetime", "status", "updated_at"])
        return appointment


class DoctorScheduleService:
    def __init__(self, doctor: User):
        self.doctor = doctor

    def confirm(self, appointment: Appointment) -> Appointment:
        if appointment.doctor != self.doctor:
            raise ValidationError("Cannot confirm another doctor's appointment")
        appointment.transition("CONFIRMED")
        return appointment

    def cancel(self, appointment: Appointment, reason: str | None = None) -> Appointment:
        if appointment.doctor != self.doctor:
            raise ValidationError("Cannot cancel another doctor's appointment")
        appointment.status = "CANCELLED"
        if reason:
            appointment.notes = f"{appointment.notes}\nCancelled: {reason}".strip()
        appointment.save(update_fields=["status", "notes", "updated_at"])
        return appointment

    def complete(self, appointment: Appointment) -> Appointment:
        if appointment.doctor != self.doctor:
            raise ValidationError("Cannot complete another doctor's appointment")
        appointment.status = "COMPLETED"
        appointment.save(update_fields=["status", "updated_at"])
        return appointment


