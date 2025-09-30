import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getDoctor, getSlots } from "../api/doctors.js";
import { useAuth } from "../auth/AuthContext.jsx";

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { data: doctor, isLoading } = useQuery({ queryKey: ["doctor", id], queryFn: () => getDoctor(id) });
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["doctor-slots", id, selectedDate],
    queryFn: () => getSlots(id, selectedDate),
  });

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  const allowedDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 15 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
  }, []);

  const handleBook = () => {
    if (!profile || profile.role !== "PATIENT") {
      navigate("/login");
      return;
    }
    navigate(`/book/${id}`, { state: { slot: selectedSlot, date: selectedDate, doctor } });
  };

  if (isLoading || !doctor) {
    return <p>Loading doctor...</p>;
  }

  return (
    <div className="card" style={{ gap: "1rem" }}>
      <h2>
        Dr. {doctor.user.first_name} {doctor.user.last_name}
      </h2>
      <p>
        <strong>Specialty:</strong> {doctor.specialty.name}
      </p>
      <p>
        <strong>Clinic:</strong> {doctor.clinic_name}
      </p>
      <p>{doctor.about}</p>
      <p>
        <strong>Consultation Fee:</strong> ₦{Number(doctor.consultation_fee).toLocaleString()}
      </p>

      <div className="form-group">
        <label htmlFor="date">Select a date</label>
        <select id="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
          {allowedDates.map((dateOption) => (
            <option key={dateOption} value={dateOption}>
              {dateOption}
            </option>
          ))}
        </select>
      </div>

      <div className="card-grid">
        {slotsLoading ? (
          <p>Loading slots...</p>
        ) : slots?.length ? (
          slots.map((slot) => (
            <button
              key={`${slot.start_time}-${slot.end_time}`}
              type="button"
              className={`button ${selectedSlot?.start_time === slot.start_time ? "" : "secondary"}`}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.start_time} - {slot.end_time}
            </button>
          ))
        ) : (
          <p>No available slots for this day.</p>
        )}
      </div>

      <button className="button" type="button" disabled={!selectedSlot} onClick={handleBook}>
        Book Appointment
      </button>
    </div>
  );
};

export default DoctorDetail;
