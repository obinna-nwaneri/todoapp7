import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelAppointment, listAppointments } from "../api/appointments.js";
import { useAuth } from "../auth/AuthContext.jsx";
import AppointmentCard from "../components/AppointmentCard.jsx";

const MyAppointments = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", role],
    queryFn: () => listAppointments(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", role] });
    },
  });

  const appointments = appointmentsQuery.data?.results ?? [];

  const upcoming = useMemo(() => appointments.filter((item) => new Date(item.date) >= new Date()), [appointments]);
  const past = useMemo(() => appointments.filter((item) => new Date(item.date) < new Date()), [appointments]);

  const handleCancel = (appointment) => {
    cancelMutation.mutate(appointment.id);
  };

  return (
    <div>
      <h2>My Appointments</h2>
      {appointmentsQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section style={{ marginBottom: "2rem" }}>
            <h3>Upcoming</h3>
            {upcoming.length ? (
              <div className="card-grid">
                {upcoming.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} role={role} onCancel={handleCancel} />
                ))}
              </div>
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </section>
          <section>
            <h3>Past</h3>
            {past.length ? (
              <div className="card-grid">
                {past.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} role={role} />
                ))}
              </div>
            ) : (
              <p>No past appointments.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default MyAppointments;
