import { useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";

const DoctorDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/doctor/appointments", { params: { page_size: 10, ordering: "start_at" } });
      setAppointments(data.results ?? data);
    } catch (err) {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, status) => {
    await api.patch(`/doctor/appointments/${id}/`, { status });
    fetchAppointments();
  };

  const pending = appointments.filter((item) => item.status === "PENDING");
  const upcoming = appointments.filter((item) => ["APPROVED", "PENDING"].includes(item.status));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Doctor Dashboard</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <section>
            <h3 className="mb-2 text-xl font-semibold">Today & Upcoming</h3>
            <DataTable
              columns={[
                { header: "Patient", accessor: "patient_name" },
                { header: "Start", accessor: "start_at" },
                { header: "Status", accessor: "status" },
              ]}
              data={upcoming}
            />
          </section>
          <section>
            <h3 className="mb-2 text-xl font-semibold">Pending Requests</h3>
            <DataTable
              columns={[
                { header: "Patient", accessor: "patient_name" },
                { header: "Start", accessor: "start_at" },
                { header: "Symptoms", accessor: "symptoms" },
                {
                  header: "Actions",
                  accessor: "actions",
                  render: (row) => (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusChange(row.id, "APPROVED")}
                        className="rounded bg-green-600 px-2 py-1 text-sm text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(row.id, "REJECTED")}
                        className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                      >
                        Reject
                      </button>
                    </div>
                  ),
                },
              ]}
              data={pending}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default DoctorDashboardPage;
