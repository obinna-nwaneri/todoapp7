import { useEffect, useState } from "react";

import apiClient from "../../api/client.js";

const statusOptions = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/doctor/appointments/", {
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

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/doctor/appointments/${id}/`, { status });
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to update status" });
    }
  };

  const totalPages = count ? Math.ceil(count / 10) : 1;

  return (
    <div>
      <h2>My Appointments</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          type="search"
          placeholder="Search symptoms or patient email"
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
                <th>Date</th>
                <th>Time</th>
                <th>Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patient_detail?.name}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.symptoms}</td>
                  <td>{appointment.status}</td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={appointment.status === status}
                        onClick={() => updateStatus(appointment.id, status)}
                      >
                        {status}
                      </button>
                    ))}
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

export default DoctorAppointmentsPage;
