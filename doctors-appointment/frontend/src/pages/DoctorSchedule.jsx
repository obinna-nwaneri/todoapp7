import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listAppointments, updateStatus } from "../api/appointments.js";
import AppointmentCard from "../components/AppointmentCard.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const DoctorSchedule = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", role],
    queryFn: () => listAppointments(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", role] });
    },
  });

  const appointments = appointmentsQuery.data?.results ?? [];
  const todaysDate = new Date().toISOString().slice(0, 10);

  const todayAppointments = useMemo(
    () => appointments.filter((item) => item.date === todaysDate),
    [appointments, todaysDate]
  );
  const upcoming = useMemo(
    () => appointments.filter((item) => item.date > todaysDate),
    [appointments, todaysDate]
  );

  const handleStatusChange = (appointment, status) => {
    statusMutation.mutate({ id: appointment.id, status });
  };

  return (
    <div>
      <h2>My Schedule</h2>
      {appointmentsQuery.isLoading ? (
        <p>Loading schedule...</p>
      ) : (
        <>
          <section style={{ marginBottom: "2rem" }}>
            <h3>Today</h3>
            {todayAppointments.length ? (
              <div className="card-grid">
                {todayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    role={role}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <p>No appointments today.</p>
            )}
          </section>
          <section>
            <h3>Upcoming</h3>
            {upcoming.length ? (
              <div className="card-grid">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    role={role}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DoctorSchedule;
