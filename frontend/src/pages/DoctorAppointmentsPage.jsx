import { useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const DoctorAppointmentsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const params = { page, search };
    if (status !== "all") params.status = status;
    const { data } = await api.get("/doctor/appointments", { params });
    const results = data.results ?? data;
    setItems(results);
    if (data.count) {
      setPages(Math.ceil(data.count / (data.results?.length || 10)) || 1);
    } else {
      setPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, status, search]);

  const handleStatus = async (id, newStatus) => {
    await api.patch(`/doctor/appointments/${id}/`, { status: newStatus });
    fetchAppointments();
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">My Appointments</h2>
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Search appointments">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="all">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </FilterBar>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <DataTable
            columns={[
              { header: "Patient", accessor: "patient_name" },
              { header: "Start", accessor: "start_at" },
              { header: "Status", accessor: "status" },
              { header: "Symptoms", accessor: "symptoms" },
              {
                header: "Actions",
                accessor: "actions",
                render: (row) => (
                  <div className="space-x-2">
                    {row.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatus(row.id, "APPROVED")}
                          className="rounded bg-green-600 px-2 py-1 text-sm text-white"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatus(row.id, "REJECTED")}
                          className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {row.status === "APPROVED" && (
                      <button
                        onClick={() => handleStatus(row.id, "COMPLETED")}
                        className="rounded bg-blue-600 px-2 py-1 text-sm text-white"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
            data={items}
          />
          <Pagination page={page} pageCount={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
