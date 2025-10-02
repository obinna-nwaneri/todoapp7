import { useEffect, useState } from "react";

import apiClient from "../../api/client.js";

const emptyForm = {
  patient: "",
  doctor: "",
  date: "",
  time: "",
  symptoms: "",
  status: "PENDING",
};

const statusOptions = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/admin/appointments/", {
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

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setForm({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      symptoms: appointment.symptoms,
      status: appointment.status,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await apiClient.delete(`/admin/appointments/${id}/`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to delete appointment" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = {
        patient: Number(form.patient),
        doctor: Number(form.doctor),
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        status: form.status,
      };
      if (editingId) {
        await apiClient.put(`/admin/appointments/${editingId}/`, payload);
      } else {
        await apiClient.post("/admin/appointments/", payload);
      }
      resetForm();
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to save appointment" });
    }
  };

  const totalPages = count ? Math.ceil(count / 10) : 1;

  return (
    <div>
      <h2>Manage Appointments</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Appointment" : "Create Appointment"}</h3>
          <label>
            Patient ID
            <input type="number" name="patient" value={form.patient} onChange={handleChange} required />
          </label>
          <label>
            Doctor ID
            <input type="number" name="doctor" value={form.doctor} onChange={handleChange} required />
          </label>
          <label>
            Date
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </label>
          <label>
            Time
            <input type="time" name="time" value={form.time} onChange={handleChange} required />
          </label>
          <label>
            Symptoms
            <textarea name="symptoms" value={form.symptoms} onChange={handleChange} required />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <input
            type="search"
            placeholder="Search symptoms or email"
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
                  <th>Patient</th>
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
                    <td>
                      {appointment.patient_detail?.name} (ID {appointment.patient})
                    </td>
                    <td>
                      {appointment.doctor_detail?.name} (ID {appointment.doctor})
                    </td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.status}</td>
                    <td>{appointment.symptoms}</td>
                    <td>
                      <button type="button" className="secondary" onClick={() => handleEdit(appointment)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(appointment.id)}>
                        Delete
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
    </div>
  );
};

export default AdminAppointmentsPage;
