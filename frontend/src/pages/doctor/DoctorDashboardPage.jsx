import { useEffect, useState } from "react";
import api from "../../api/client";

export default function DoctorDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/doctor/dashboard").then(({ data }) => setData(data));
  }, []);

  if (!data) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Pending Requests</h3>
          <p>{data.pending.length}</p>
        </div>
        <div className="card">
          <h3>Today's Schedule</h3>
          <p>{data.today.length}</p>
        </div>
        <div className="card">
          <h3>Upcoming</h3>
          <p>{data.upcoming.length}</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Next Appointments</h3>
        <ul>
          {data.upcoming.map((appt) => (
            <li key={appt.id}>
              {appt.start_at} - {appt.patient} ({appt.status})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
