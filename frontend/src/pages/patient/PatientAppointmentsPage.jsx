import { useEffect, useState } from "react";

import apiClient from "../../api/client.js";

const statusOptions = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ date: "", time: "", symptoms: "" });

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/patient/appointments/", {
        params: {
          page,
          search,
          status: statusFilter || undefined,
          date: dateFilter || undefined,
        },
      });
      setAppointments(data.results || data);
      setCount(data.count || data.length || 0);
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to load appointments" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, search, statusFilter, dateFilter]);

  const startEdit = (appointment) => {
    setEditingId(appointment.id);
    setForm({ date: appointment.date, time: appointment.time, symptoms: appointment.symptoms });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ date: "", time: "", symptoms: "" });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      await apiClient.put(`/patient/appointments/${editingId}/`, {
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
      });
      cancelEdit();
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to update appointment" });
    }
  };

  const cancelAppointment = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await apiClient.delete(`/patient/appointments/${id}/`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to cancel appointment" });
    }
  };

  const totalPages = count ? Math.ceil(count / 10) : 1;

  return (
    <div>
      <h2>My Appointments</h2>
      {editingId && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <form onSubmit={saveEdit}>
            <h3>Edit Appointment</h3>
            <label>
              Date
              <input type="date" name="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
            </label>
            <label>
              Time
              <input type="time" name="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} required />
            </label>
            <label>
              Symptoms
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                required
              />
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit">Save</button>
              <button type="button" className="secondary" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          type="search"
          placeholder="Search symptoms or doctor email"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(event.target.value);
          }}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => {
            setPage(1);
            setDateFilter(event.target.value);
          }}
        />
      </div>
      {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Symptoms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.doctor_detail?.name}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td>{appointment.symptoms}</td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="secondary"
                      disabled={appointment.status !== "PENDING"}
                      onClick={() => startEdit(appointment)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={appointment.status !== "PENDING"}
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button type="button" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientAppointmentsPage;
