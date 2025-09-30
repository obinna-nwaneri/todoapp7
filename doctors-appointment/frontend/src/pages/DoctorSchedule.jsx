import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listMine, updateStatus } from "../api/appointments.js";
import AppointmentCard from "../components/AppointmentCard.jsx";

const DoctorSchedule = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["doctor-appointments"], queryFn: listMine });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] })
  });

  const handleStatusChange = (appointment, status) => {
    statusMutation.mutate({ id: appointment.id, status });
  };

  if (isLoading) {
    return <p>Loading schedule...</p>;
  }

  const appointments = data?.results || [];

  return (
    <div className="card" style={{ gap: "1rem" }}>
      <h2>Upcoming Schedule</h2>
      {appointments.length === 0 && <p>No appointments scheduled.</p>}
      <div className="card-grid">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );
};

export default DoctorSchedule;
