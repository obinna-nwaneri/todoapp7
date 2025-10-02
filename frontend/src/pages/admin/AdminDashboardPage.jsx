import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: statsData }, { data: reportData }] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/reports/appointments"),
      ]);
      setStats(statsData);
      setReports(reportData);
    };
    fetchData();
  }, []);

  if (!stats) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="card-grid">
        <div className="card">
          <h3>Doctors</h3>
          <p>{stats.doctors}</p>
        </div>
        <div className="card">
          <h3>Patients</h3>
          <p>{stats.patients}</p>
        </div>
        <div className="card">
          <h3>Total Appointments</h3>
          <p>{stats.appointments}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>
        <div className="card">
          <h3>Today</h3>
          <p>{stats.today}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Quick Links</h3>
        <div className="actions">
          <Link className="btn-primary" to="/admin-panel/doctors">
            Manage Doctors
          </Link>
          <Link className="btn-primary" to="/admin-panel/patients">
            Manage Patients
          </Link>
          <Link className="btn-primary" to="/admin-panel/appointments">
            Manage Appointments
          </Link>
        </div>
      </div>

      {reports ? (
        <div className="card" style={{ marginTop: "2rem" }}>
          <h3>Appointments per Doctor</h3>
          <ul>
            {reports.per_doctor.map((row) => (
              <li key={row.doctor__name}>{row.doctor__name || "Unassigned"}: {row.count}</li>
            ))}
          </ul>
          <h3>Appointments per Specialization</h3>
          <ul>
            {reports.per_specialization.map((row) => (
              <li key={row.doctor__specialization}>{row.doctor__specialization || "Unassigned"}: {row.count}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
