import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listMine } from "../api/appointments.js";

const AdminPanel = () => {
  const { data, isLoading } = useQuery({ queryKey: ["admin-appointments"], queryFn: listMine });
  const appointments = data?.results || [];

  const stats = useMemo(() => {
    return appointments.reduce(
      (acc, appointment) => {
        acc.total += 1;
        acc.byStatus[appointment.status] = (acc.byStatus[appointment.status] || 0) + 1;
        return acc;
      },
      { total: 0, byStatus: {} }
    );
  }, [appointments]);

  if (isLoading) {
    return <p>Loading admin overview...</p>;
  }

  return (
    <div className="card" style={{ gap: "1rem" }}>
      <h2>Admin Overview</h2>
      <p>Total appointments: {stats.total}</p>
      <div>
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <span key={status} className={`badge status-${status}`} style={{ marginRight: "0.5rem" }}>
            {status}: {count}
          </span>
        ))}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>
                Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
              </td>
              <td>
                {appointment.patient.user.first_name} {appointment.patient.user.last_name}
              </td>
              <td>{appointment.date}</td>
              <td>
                {appointment.start_time} - {appointment.end_time}
              </td>
              <td>{appointment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
