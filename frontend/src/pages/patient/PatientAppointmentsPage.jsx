import { useEffect, useState } from "react";
import api from "../../api/client";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const loadAppointments = async (pageNumber = 1, term = search) => {
    const { data } = await api.get("/patient/appointments/", { params: { page: pageNumber, search: term } });
    setAppointments(data);
    setPage(pageNumber);
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelAppointment = async (id) => {
    await api.delete(`/patient/appointments/${id}/`);
    loadAppointments(page, search);
  };

  if (!appointments) {
    return <div className="center">Loading...</div>;
  }

  return (
    <div>
      <h2>My Appointments</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadAppointments(1, search);
        }}
        style={{ marginBottom: "1rem" }}
      >
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search appointments" />
        <button className="btn-secondary" type="submit">
          Search
        </button>
      </form>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Start</th>
              <th>Status</th>
              <th>Symptoms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.results.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.doctor_name}</td>
                <td>{new Date(appointment.start_at).toLocaleString()}</td>
                <td>{appointment.status}</td>
                <td>{appointment.symptoms}</td>
                <td>
                  {appointment.status === "PENDING" ? (
                    <button className="btn-secondary" onClick={() => cancelAppointment(appointment.id)} type="button">
                      Cancel
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions" style={{ marginTop: "1rem" }}>
          <button className="btn-secondary" disabled={!appointments.previous} onClick={() => loadAppointments(page - 1, search)} type="button">
            Previous
          </button>
          <button className="btn-secondary" disabled={!appointments.next} onClick={() => loadAppointments(page + 1, search)} type="button">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
