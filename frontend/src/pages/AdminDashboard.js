import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../api";

const AdminDashboard = () => {
  const { tokens } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState({ name: "", specialization: "", availability_schedule: "" });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    try {
      const [doctorData, patientData, appointmentData] = await Promise.all([
        apiRequest("doctors/", { tokens }),
        apiRequest("admin/patients/", { tokens }),
        apiRequest("admin/appointments/", { tokens })
      ]);
      setDoctors(doctorData);
      setPatients(patientData);
      setAppointments(appointmentData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDoctor = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await apiRequest("doctors/", { method: "POST", tokens, body: doctorForm });
      setDoctorForm({ name: "", specialization: "", availability_schedule: "" });
      setMessage("Doctor added successfully.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateDoctor = async (doctor) => {
    const name = window.prompt("Doctor name", doctor.name);
    if (name === null) return;
    const specialization = window.prompt("Specialization", doctor.specialization);
    if (specialization === null) return;
    const availability_schedule = window.prompt("Availability", doctor.availability_schedule);
    if (availability_schedule === null) return;

    try {
      await apiRequest(`doctors/${doctor.id}/`, {
        method: "PUT",
        tokens,
        body: { name, specialization, availability_schedule }
      });
      setMessage("Doctor updated successfully.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Remove this doctor?")) return;
    try {
      await apiRequest(`doctors/${doctorId}/`, { method: "DELETE", tokens });
      setMessage("Doctor removed.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await apiRequest(`admin/appointments/${appointmentId}/`, { method: "PATCH", tokens, body: { status } });
      setMessage(`Appointment ${status.toLowerCase()} successfully.`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Administrator Console</h1>
          <p className="text-muted">Manage doctors, review appointments, and view patient details.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Add Doctor</h4>
              <form onSubmit={handleCreateDoctor}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    className="form-control"
                    id="name"
                    name="name"
                    value={doctorForm.name}
                    onChange={handleDoctorChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="specialization">
                    Specialization
                  </label>
                  <input
                    className="form-control"
                    id="specialization"
                    name="specialization"
                    value={doctorForm.specialization}
                    onChange={handleDoctorChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="availability_schedule">
                    Availability schedule
                  </label>
                  <textarea
                    className="form-control"
                    id="availability_schedule"
                    name="availability_schedule"
                    rows="3"
                    value={doctorForm.availability_schedule}
                    onChange={handleDoctorChange}
                    required
                  />
                </div>
                <button className="btn btn-primary w-100" type="submit">
                  Save doctor
                </button>
              </form>
            </div>
          </div>
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Patients</h4>
              {patients.length === 0 ? (
                <p className="text-muted mb-0">No registered patients yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {patients.map((patient) => (
                    <li key={patient.id} className="list-group-item">
                      <strong>
                        {patient.first_name} {patient.last_name}
                      </strong>
                      <div className="small text-muted">{patient.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Doctors</h4>
              {doctors.length === 0 ? (
                <p className="text-muted">Add doctors to start receiving appointments.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Availability</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor.id}>
                          <td>{doctor.name}</td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.availability_schedule}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => handleUpdateDoctor(doctor)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Appointments</h4>
              {appointments.length === 0 ? (
                <p className="text-muted">No appointments have been scheduled yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Symptoms</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            {appointment.patient.first_name} {appointment.patient.last_name}
                            <div className="small text-muted">{appointment.patient.email}</div>
                          </td>
                          <td>{appointment.doctor.name}</td>
                          <td>{appointment.date}</td>
                          <td>{appointment.time}</td>
                          <td>
                            <span className={`badge bg-${appointment.status === "APPROVED" ? "success" : appointment.status === "REJECTED" ? "danger" : "secondary"}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td>{appointment.symptoms}</td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleStatusChange(appointment.id, "APPROVED")}
                                disabled={appointment.status === "APPROVED"}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleStatusChange(appointment.id, "REJECTED")}
                                disabled={appointment.status === "REJECTED"}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
