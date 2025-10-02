import { useEffect, useState } from "react";
import { apiRequest, endpoints } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const defaultDoctor = { name: "", specialization: "", availability_schedule: "" };

const AdminDashboard = () => {
  const { tokens } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState(defaultDoctor);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setError(null);
    try {
      const [doctorList, appointmentList] = await Promise.all([
        apiRequest(endpoints.doctors, { token: tokens.access }),
        apiRequest(endpoints.adminAppointments, { token: tokens.access })
      ]);
      setDoctors(doctorList);
      setAppointments(appointmentList);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (tokens?.access) {
      loadData();
    }
  }, [tokens]);

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitDoctor = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      if (editingDoctorId) {
        await apiRequest(`${endpoints.doctors}${editingDoctorId}/`, {
          method: "PUT",
          token: tokens.access,
          body: doctorForm
        });
        setMessage("Doctor updated successfully.");
      } else {
        await apiRequest(endpoints.doctors, {
          method: "POST",
          token: tokens.access,
          body: doctorForm
        });
        setMessage("Doctor created successfully.");
      }
      setDoctorForm(defaultDoctor);
      setEditingDoctorId(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editDoctor = (doctor) => {
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      availability_schedule: doctor.availability_schedule
    });
    setEditingDoctorId(doctor.id);
    setMessage(null);
  };

  const deleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`${endpoints.doctors}${doctorId}/`, {
        method: "DELETE",
        token: tokens.access
      });
      setMessage("Doctor removed.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`${endpoints.adminAppointments}${appointmentId}/`, {
        method: "PATCH",
        token: tokens.access,
        body: { status }
      });
      setMessage("Appointment status updated.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">{editingDoctorId ? "Edit doctor" : "Add doctor"}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={submitDoctor}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={doctorForm.name}
                    onChange={handleDoctorChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    className="form-control"
                    name="specialization"
                    value={doctorForm.specialization}
                    onChange={handleDoctorChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Availability</label>
                  <textarea
                    className="form-control"
                    name="availability_schedule"
                    value={doctorForm.availability_schedule}
                    onChange={handleDoctorChange}
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {editingDoctorId ? "Update" : "Create"}
                  </button>
                  {editingDoctorId && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => {
                        setDoctorForm(defaultDoctor);
                        setEditingDoctorId(null);
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
        <div className="col-lg-7">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Doctors ({doctors.length})</h5>
            </div>
            <div className="card-body">
              {doctors.length === 0 ? (
                <div className="alert alert-info">No doctors available.</div>
              ) : (
                <ul className="list-group">
                  {doctors.map((doctor) => (
                    <li key={doctor.id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{doctor.name}</h6>
                        <small className="text-muted">{doctor.specialization}</small>
                        <p className="mb-1">{doctor.availability_schedule}</p>
                      </div>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => editDoctor(doctor)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteDoctor(doctor.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Appointments</h5>
            </div>
            <div className="card-body">
              {appointments.length === 0 ? (
                <div className="alert alert-info">No appointment requests yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Symptoms</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.patient_email}</td>
                          <td>{appointment.doctor_name}</td>
                          <td>{appointment.date}</td>
                          <td>{appointment.time}</td>
                          <td>{appointment.status}</td>
                          <td style={{ maxWidth: "220px" }}>{appointment.symptoms}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => updateAppointmentStatus(appointment.id, "Approved")}
                                disabled={appointment.status === "Approved"}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => updateAppointmentStatus(appointment.id, "Pending")}
                                disabled={appointment.status === "Pending"}
                              >
                                Pending
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => updateAppointmentStatus(appointment.id, "Rejected")}
                                disabled={appointment.status === "Rejected"}
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
