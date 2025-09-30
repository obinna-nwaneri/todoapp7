import React, { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelAppointment, listMine } from "../api/appointments.js";
import AppointmentCard from "../components/AppointmentCard.jsx";

const MyAppointments = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["my-appointments"], queryFn: listMine });

  const cancelMutation = useMutation({
    mutationFn: (appointment) => cancelAppointment(appointment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
  });

  const appointments = data?.results || [];
  const { upcoming, past } = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return {
      upcoming: appointments.filter((appointment) => appointment.date >= now),
      past: appointments.filter((appointment) => appointment.date < now)
    };
  }, [appointments]);

  if (isLoading) {
    return <p>Loading appointments...</p>;
  }

  return (
    <div className="card" style={{ gap: "1.5rem" }}>
      <section>
        <h2>Upcoming Appointments</h2>
        {upcoming.length === 0 && <p>No upcoming bookings yet.</p>}
        <div className="card-grid">
          {upcoming.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} onCancel={cancelMutation.mutate} />
          ))}
        </div>
      </section>
      <section>
        <h2>Past Appointments</h2>
        {past.length === 0 && <p>No past appointments recorded.</p>}
        <div className="card-grid">
          {past.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MyAppointments;
