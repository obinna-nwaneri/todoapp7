import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import DataTable from "../components/DataTable";

const PatientDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data } = await api.get("/patient/appointments", { params: { page_size: 20 } });
      setAppointments(data.results ?? data);
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter((item) => ["PENDING", "APPROVED"].includes(item.status));
  const past = appointments.filter((item) => ["COMPLETED", "REJECTED", "CANCELLED"].includes(item.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Patient Dashboard</h2>
        <Link to="/patient-panel/book" className="rounded bg-blue-700 px-4 py-2 text-white">
          Book Appointment
        </Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <section>
            <h3 className="mb-2 text-xl font-semibold">Upcoming</h3>
            <DataTable
              columns={[
                { header: "Doctor", accessor: "doctor_name" },
                { header: "Start", accessor: "start_at" },
                { header: "Status", accessor: "status" },
              ]}
              data={upcoming}
            />
          </section>
          <section>
            <h3 className="mb-2 text-xl font-semibold">Past / Closed</h3>
            <DataTable
              columns={[
                { header: "Doctor", accessor: "doctor_name" },
                { header: "Start", accessor: "start_at" },
                { header: "Status", accessor: "status" },
              ]}
              data={past}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default PatientDashboardPage;
