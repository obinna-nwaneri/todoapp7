import { useEffect, useState } from "react";

import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [doctorRes, patientRes, appointmentRes] = await Promise.all([
          api.get("/doctors"),
          user?.is_staff ? api.get("/patients") : Promise.resolve({ data: [] }),
          api.get("/appointments"),
        ]);
        setStats({
          doctors: doctorRes.data.length,
          patients: user?.is_staff ? patientRes.data.length : 0,
          appointments: appointmentRes.data.length,
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data");
      }
    };

    loadStats();
  }, [user]);

  return (
    <div className="container">
      <h1 className="mb-4">Admin Dashboard</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card text-bg-primary shadow">
            <div className="card-body">
              <h5 className="card-title">Doctors</h5>
              <p className="display-6">{stats.doctors}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-success shadow">
            <div className="card-body">
              <h5 className="card-title">Patients</h5>
              <p className="display-6">{stats.patients}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-warning shadow">
            <div className="card-body">
              <h5 className="card-title">Appointments</h5>
              <p className="display-6">{stats.appointments}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
