import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { createAppointment } from "../api/appointments.js";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state || {};
  const [reason, setReason] = useState("");
  const mutation = useMutation({ mutationFn: createAppointment, onSuccess: () => navigate("/me/appointments") });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!initialState?.slot || !initialState.date) {
      return;
    }
    mutation.mutate({
      doctor_id: Number(doctorId),
      date: initialState.date,
      start_time: initialState.slot.start_time,
      end_time: initialState.slot.end_time,
      reason
    });
  };

  if (!initialState?.slot) {
    return <p>No slot selected. Please return to the doctor&apos;s profile.</p>;
  }

  return (
    <div className="card" style={{ gap: "1rem" }}>
      <h2>Confirm Appointment</h2>
      <p>
        Date: {initialState.date} · {initialState.slot.start_time} - {initialState.slot.end_time}
      </p>
      <form onSubmit={handleSubmit} className="form-group" style={{ gap: "1rem" }}>
        <div className="form-group">
          <label htmlFor="reason">Reason (optional)</label>
          <textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={4} />
        </div>
        <button className="button" type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Booking..." : "Confirm"}
        </button>
        {mutation.isError && <p style={{ color: "#dc2626" }}>Unable to book this slot. Please try another time.</p>}
      </form>
    </div>
  );
};

export default BookAppointment;
