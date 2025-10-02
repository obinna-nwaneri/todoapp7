import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function PatientDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/patient/dashboard").then(({ data }) => setData(data));
  }, []);

  if (!data) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div>
      <h2>Patient Dashboard</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Upcoming</h3>
          <p>{data.upcoming.length}</p>
        </div>
        <div className="card">
          <h3>Past</h3>
          <p>{data.past.length}</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Next Appointments</h3>
        <ul>
          {data.upcoming.map((appt) => (
            <li key={appt.id}>
              {appt.start_at} with {appt.doctor} ({appt.status})
            </li>
          ))}
        </ul>
        <Link className="btn-primary" to="/patient-panel/book">
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
