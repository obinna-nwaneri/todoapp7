import { useEffect, useState } from "react";
import api from "../../api/client";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState(null);
  const [filters, setFilters] = useState({ status: "", start: "", end: "", search: "" });
  const [page, setPage] = useState(1);

  const loadAppointments = async (pageNumber = 1, params = filters) => {
    const { status, start, end, search } = params;
    const query = {};
    if (status) query.status = status;
    if (start) query.start_date = start;
    if (end) query.end_date = end;
    if (search) query.search = search;
    query.page = pageNumber;
    const { data } = await api.get("/admin/appointments/", { params: query });
    setAppointments(data);
    setPage(pageNumber);
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadAppointments(1, filters);
  };

  const updateStatus = async (id, status) => {
    await api.post(`/admin/appointments/${id}/status/`, { status });
    loadAppointments(page, filters);
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.start) params.append("start", filters.start);
    if (filters.end) params.append("end", filters.end);
    window.open(`${import.meta.env.VITE_API_BASE_URL}/admin/appointments/export?${params.toString()}`);
  };

  if (!appointments) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div>
      <h2>Appointments</h2>
      <form onSubmit={handleFilter} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} />
        <input type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} />
        <input placeholder="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <button className="btn-secondary" type="submit">
          Apply
        </button>
        <button type="button" className="btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      </form>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Start</th>
              <th>Status</th>
              <th>Symptoms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.results.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.doctor_name}</td>
                <td>{appointment.patient_name}</td>
                <td>{new Date(appointment.start_at).toLocaleString()}</td>
                <td>{appointment.status}</td>
                <td>{appointment.symptoms}</td>
                <td>
                  <div className="actions">
                    {STATUS_OPTIONS.filter((status) => status !== appointment.status).map((status) => (
                      <button key={status} className="btn-secondary" onClick={() => updateStatus(appointment.id, status)} type="button">
                        {status}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions" style={{ marginTop: "1rem" }}>
          <button className="btn-secondary" disabled={!appointments.previous} onClick={() => loadAppointments(page - 1, filters)} type="button">
            Previous
          </button>
          <button className="btn-secondary" disabled={!appointments.next} onClick={() => loadAppointments(page + 1, filters)} type="button">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
