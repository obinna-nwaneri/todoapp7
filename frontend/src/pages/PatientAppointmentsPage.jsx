import { useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const PatientAppointmentsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ start_at: "", symptoms: "" });
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const params = { page, search };
    if (status !== "all") params.status = status;
    const { data } = await api.get("/patient/appointments", { params });
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

  const startEdit = (record) => {
    setEditing(record.id);
    setForm({
      start_at: record.start_at.slice(0, 16),
      symptoms: record.symptoms,
    });
  };

  const saveEdit = async () => {
    await api.patch(`/patient/appointments/${editing}/`, form);
    setEditing(null);
    fetchAppointments();
  };

  const cancelAppointment = async (id) => {
    await api.post(`/patient/appointments/${id}/cancel/`);
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
              { header: "Doctor", accessor: "doctor_name" },
              { header: "Start", accessor: "start_at" },
              { header: "Status", accessor: "status" },
              {
                header: "Actions",
                accessor: "actions",
                render: (row) => (
                  <div className="space-x-2">
                    {row.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => startEdit(row)}
                          className="rounded bg-blue-600 px-2 py-1 text-sm text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => cancelAppointment(row.id)}
                          className="rounded bg-red-600 px-2 py-1 text-sm text-white"
                        >
                          Cancel
                        </button>
                      </>
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
      {editing && (
        <div className="mt-6 rounded bg-white p-4 shadow">
          <h3 className="mb-2 text-lg font-semibold">Edit Appointment</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Start time
              <input
                type="datetime-local"
                value={form.start_at}
                onChange={(e) => setForm((prev) => ({ ...prev, start_at: e.target.value }))}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium text-gray-700 md:col-span-2">
              Symptoms
              <textarea
                value={form.symptoms}
                onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                rows="3"
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-4 space-x-2">
            <button onClick={saveEdit} className="rounded bg-blue-700 px-3 py-2 text-white">
              Save
            </button>
            <button onClick={() => setEditing(null)} className="rounded border px-3 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentsPage;
