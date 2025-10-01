import { useEffect, useMemo, useState } from "react";

import api from "../api";

const initialForm = {
  doctorId: "",
  patientId: "",
  date: "",
  time: "",
  status: "Scheduled",
};

const statuses = ["Scheduled", "Completed", "Cancelled"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      const [appointmentRes, doctorRes, patientRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/doctors"),
        api.get("/patients"),
      ]);
      setAppointments(appointmentRes.data);
      setDoctors(doctorRes.data);
      setPatients(patientRes.data);
    } catch (err) {
      console.error(err);
      setMessage("Unable to load appointments data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const doctorOptions = useMemo(
    () =>
      doctors.map((doctor) => ({
        value: doctor.id,
        label: `${doctor.name} (${doctor.specialization})`,
      })),
    [doctors]
  );

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        value: patient.id,
        label: `${patient.name} (${patient.email})`,
      })),
    [patients]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    doctor_id: Number(form.doctorId),
    patient_id: Number(form.patientId),
    date: form.date,
    time: form.time,
    status: form.status,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}/`, buildPayload());
        setMessage("Appointment updated successfully");
      } else {
        await api.post("/appointments/", buildPayload());
        setMessage("Appointment created successfully");
      }
      setForm(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
      setMessage("Unable to save appointment.");
    }
  };

  const handleEdit = (appointment) => {
    setMessage(null);
    setEditingId(appointment.id);
    setForm({
      doctorId: String(appointment.doctor?.id ?? appointment.doctor ?? ""),
      patientId: String(appointment.patient?.id ?? appointment.patient ?? ""),
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    });
  };

  const handleCancelAppointment = async (id) => {
    setMessage(null);
    try {
      await api.delete(`/appointments/${id}/`);
      setMessage("Appointment cancelled");
      loadData();
    } catch (err) {
      console.error(err);
      setMessage("Unable to cancel appointment.");
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Appointments</h1>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">Upcoming Appointments</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.doctor?.name}</td>
                        <td>{appointment.patient?.name}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.status}</td>
                        <td className="table-actions">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(appointment)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title">
                {editingId ? "Update Appointment" : "Book Appointment"}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Doctor</label>
                  <select
                    className="form-select"
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctorOptions.map((doctor) => (
                      <option key={doctor.value} value={doctor.value}>
                        {doctor.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Patient</label>
                  <select
                    className="form-select"
                    name="patientId"
                    value={form.patientId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select patient</option>
                    {patientOptions.map((patient) => (
                      <option key={patient.value} value={patient.value}>
                        {patient.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    className="form-control"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Time</label>
                  <input
                    className="form-control"
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-success" type="submit">
                    {editingId ? "Update" : "Create"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingId(null);
                        setForm(initialForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
