import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listAppointments } from "../api/appointments.js";

const AdminPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "ADMIN"],
    queryFn: () => listAppointments(),
  });

  const appointments = data?.results ?? [];

  const counts = useMemo(() => {
    return appointments.reduce(
      (acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      },
      {}
    );
  }, [appointments]);

  const recent = appointments.slice(0, 10);

  return (
    <div className="card">
      <h2>Admin Overview</h2>
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {Object.entries(counts).map(([status, total]) => (
              <div key={status} className="card" style={{ minWidth: "180px" }}>
                <h4>{status}</h4>
                <p style={{ fontSize: "1.5rem", margin: 0 }}>{total}</p>
              </div>
            ))}
          </section>
          <section>
            <h3>Latest appointments</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>
                      {appointment.start_time} - {appointment.end_time}
                    </td>
                    <td>
                      Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                    </td>
                    <td>
                      {appointment.patient.user.first_name} {appointment.patient.user.last_name}
                    </td>
                    <td>{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
