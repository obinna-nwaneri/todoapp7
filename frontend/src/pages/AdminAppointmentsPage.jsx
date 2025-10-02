import { useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const AdminAppointmentsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startFrom, setStartFrom] = useState("");
  const [startTo, setStartTo] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const params = { page, search };
    if (status !== "all") params.status = status;
    if (startFrom) params.start_from = startFrom;
    if (startTo) params.start_to = startTo;
    const { data } = await api.get("/admin/appointments", { params });
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
  }, [page, status, startFrom, startTo, search]);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Appointments</h2>
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Search by doctor, patient, symptoms">
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
        <input
          type="datetime-local"
          value={startFrom}
          onChange={(e) => setStartFrom(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <input
          type="datetime-local"
          value={startTo}
          onChange={(e) => setStartTo(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <button
          type="button"
          onClick={() => {
            setStartFrom("");
            setStartTo("");
            setStatus("all");
            setSearch("");
            setPage(1);
          }}
          className="rounded border px-3 py-2"
        >
          Reset
        </button>
      </FilterBar>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <DataTable
            columns={[
              { header: "Doctor", accessor: "doctor_name" },
              { header: "Patient", accessor: "patient_name" },
              { header: "Start", accessor: "start_at" },
              { header: "Status", accessor: "status" },
              { header: "Symptoms", accessor: "symptoms" },
            ]}
            data={items}
          />
          <Pagination page={page} pageCount={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminAppointmentsPage;
