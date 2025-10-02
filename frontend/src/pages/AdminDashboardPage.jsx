import { useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/appointments", { params: { status: "PENDING", page_size: 5 } }),
        ]);
        setStats(statsRes.data);
        setPending(pendingRes.data.results ?? pendingRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Doctors" value={stats.doctors} />
          <StatCard label="Patients" value={stats.patients} />
          <StatCard label="Appointments" value={stats.appointments} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Today's Bookings" value={stats.today} />
        </div>
      )}
      <div>
        <h3 className="mb-2 text-xl font-semibold">Pending Approvals</h3>
        <DataTable
          columns={[
            { header: "Doctor", accessor: "doctor_name" },
            { header: "Patient", accessor: "patient_name" },
            { header: "Start", accessor: "start_at" },
            { header: "Status", accessor: "status" },
          ]}
          data={pending}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
