import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getDoctor, getSlots } from "../api/doctors.js";
import { useAuth } from "../auth/AuthContext.jsx";

const dateOptions = () => {
  const today = new Date();
  return Array.from({ length: 15 }).map((_, index) => {
    const d = new Date();
    d.setDate(today.getDate() + index);
    return d.toISOString().slice(0, 10);
  });
};

const DoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => dateOptions()[0]);

  const doctorQuery = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctor(doctorId),
    enabled: Boolean(doctorId),
  });

  const slotsQuery = useQuery({
    queryKey: ["doctor-slots", doctorId, selectedDate],
    queryFn: () => getSlots(doctorId, selectedDate),
    enabled: Boolean(doctorId && selectedDate),
  });

  const options = useMemo(dateOptions, []);

  if (doctorQuery.isLoading) {
    return <p>Loading doctor...</p>;
  }

  const doctor = doctorQuery.data;

  const handleBook = (slot) => {
    navigate(`/book/${doctorId}?date=${selectedDate}&start=${slot.start_time}&end=${slot.end_time}`);
  };

  return (
    <div className="card">
      <h2>
        Dr. {doctor.user.first_name} {doctor.user.last_name}
      </h2>
      <p>{doctor.specialty.name}</p>
      <p>{doctor.clinic_name}</p>
      <p>{doctor.about}</p>
      <p>Consultation fee: ₦{Number(doctor.consultation_fee).toLocaleString()}</p>

      <div style={{ marginTop: "1.5rem" }}>
        <label htmlFor="appointment-date">Select a date</label>
        <select id="appointment-date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
          {options.map((value) => (
            <option key={value} value={value}>
              {new Date(value).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h3>Available slots</h3>
        {slotsQuery.isLoading ? (
          <p>Loading slots...</p>
        ) : slotsQuery.data?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {slotsQuery.data.map((slot) => (
              <button key={`${slot.start_time}`} type="button" className="secondary" onClick={() => handleBook(slot)} disabled={role !== "PATIENT"}>
                {slot.start_time} - {slot.end_time}
              </button>
            ))}
          </div>
        ) : (
          <p>No slots available for this day.</p>
        )}
        {role !== "PATIENT" && <p style={{ marginTop: "0.5rem" }}>Login as a patient to book.</p>}
      </div>
    </div>
  );
};

export default DoctorDetail;
