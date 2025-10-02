import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiClient from "../../api/client.js";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    total_doctors: 0,
    total_patients: 0,
    total_appointments: 0,
    pending_appointments: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get("/admin/stats/");
        setStats(data);
      } catch (err) {
        setError(err.response?.data || { detail: "Unable to load stats" });
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
      <div className="card-grid">
        <div className="card">
          <h3>Total Doctors</h3>
          <p>{stats.total_doctors}</p>
        </div>
        <div className="card">
          <h3>Total Patients</h3>
          <p>{stats.total_patients}</p>
        </div>
        <div className="card">
          <h3>Total Appointments</h3>
          <p>{stats.total_appointments}</p>
        </div>
        <div className="card">
          <h3>Pending Appointments</h3>
          <p>{stats.pending_appointments}</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3>Quick Links</h3>
        <ul>
          <li>
            <Link to="/admin-panel/doctors">Manage Doctors</Link>
          </li>
          <li>
            <Link to="/admin-panel/patients">Manage Patients</Link>
          </li>
          <li>
            <Link to="/admin-panel/appointments">Manage Appointments</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
