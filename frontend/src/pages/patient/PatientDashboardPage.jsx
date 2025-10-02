import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../../api/client.js";

const PatientDashboardPage = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await apiClient.get("/patient/appointments/", {
          params: { ordering: "date" },
        });
        const items = data.results || data;
        setUpcoming(items.filter((item) => item.status !== "COMPLETED").slice(0, 5));
      } catch (err) {
        setError(err.response?.data || { detail: "Unable to load appointments" });
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>Patient Dashboard</h2>
      {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
      <div className="card">
        <h3>Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p>No upcoming appointments yet.</p>
        ) : (
          <ul>
            {upcoming.map((appointment) => (
              <li key={appointment.id}>
                {appointment.date} {appointment.time} – {appointment.doctor_detail?.name} ({appointment.status})
              </li>
            ))}
          </ul>
        )}
        <Link to="/patient-panel/book" style={{ marginTop: "1rem", display: "inline-block" }}>
          Book a new appointment
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
