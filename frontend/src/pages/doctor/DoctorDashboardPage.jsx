import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../../api/client.js";

const DoctorDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await apiClient.get("/doctor/appointments/", {
          params: { ordering: "date" },
        });
        const items = data.results || data;
        setAppointments(items.filter((item) => item.status !== "COMPLETED").slice(0, 5));
      } catch (err) {
        setError(err.response?.data || { detail: "Unable to load appointments" });
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
      <div className="card">
        <h3>Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul>
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                {appointment.date} {appointment.time} – {appointment.patient_detail?.name} ({appointment.status})
              </li>
            ))}
          </ul>
        )}
        <Link to="/doctor-panel/appointments" style={{ marginTop: "1rem", display: "inline-block" }}>
          View all appointments
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
