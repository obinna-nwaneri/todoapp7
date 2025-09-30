import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAppointment } from "../api/appointments.js";
import { getDoctor } from "../api/doctors.js";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const date = searchParams.get("date");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const doctorQuery = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctor(doctorId),
    enabled: Boolean(doctorId),
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      navigate("/me/appointments");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ doctor: Number(doctorId), date, start_time: start, end_time: end, reason });
  };

  if (!date || !start || !end) {
    return <p>Select a slot from the doctor profile page.</p>;
  }

  return (
    <div className="card">
      <h2>Confirm appointment</h2>
      {doctorQuery.data && (
        <p>
          Booking Dr. {doctorQuery.data.user.first_name} {doctorQuery.data.user.last_name} at {doctorQuery.data.clinic_name}
        </p>
      )}
      <p>
        {new Date(date).toLocaleDateString()} — {start} to {end}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="reason">Reason (optional)</label>
        <textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={4} />
        <button type="submit" className="primary" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Booking..." : "Confirm booking"}
        </button>
      </form>
      {mutation.isError && <p style={{ color: "#b91c1c" }}>Unable to book this slot. Please choose another.</p>}
    </div>
  );
};

export default BookAppointment;
