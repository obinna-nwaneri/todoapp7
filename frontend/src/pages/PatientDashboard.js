import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../api";

const PatientDashboard = () => {
  const { tokens, user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [formData, setFormData] = useState({ doctor_id: "", date: "", time: "", symptoms: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [doctorsData, appointmentData] = await Promise.all([
        apiRequest("doctors/", { tokens }),
        apiRequest("patient/appointments/", { tokens })
      ]);
      setDoctors(doctorsData);
      setAppointments(appointmentData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await apiRequest("patient/appointments/", { method: "POST", tokens, body: formData });
      setFormData({ doctor_id: "", date: "", time: "", symptoms: "" });
      setMessage("Appointment request submitted! We'll notify you once it's reviewed.");
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderAppointmentCard = (appt) => (
    <div key={appt.id} className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{appt.doctor.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{appt.doctor.specialization}</h6>
        <p className="card-text mb-1">
          {appt.date} @ {appt.time} &mdash; <strong>{appt.status_display}</strong>
        </p>
        <p className="card-text">
          <span className="fw-semibold">Symptoms:</span> {appt.symptoms}
        </p>
        {appt.status === "APPROVED" && (
          <div className="alert alert-success py-1 mb-0">Your appointment has been approved.</div>
        )}
        {appt.status === "REJECTED" && (
          <div className="alert alert-warning py-1 mb-0">
            Unfortunately this appointment was rejected. Please select a different time.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Welcome back, {user?.first_name || "Patient"}!</h1>
          <p className="text-muted">Book appointments, track approvals, and review your visit history.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Book a new appointment</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="doctor_id">
                    Select Doctor
                  </label>
                  <select
                    id="doctor_id"
                    name="doctor_id"
                    className="form-select"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} &mdash; {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="date">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      className="form-control"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="time">
                      Time
                    </label>
                    <input
                      id="time"
                      type="time"
                      name="time"
                      className="form-control"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="symptoms">
                    Describe your symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    rows="4"
                    className="form-control"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Please provide as much detail as possible"
                    required
                  />
                </div>
                <button className="btn btn-primary w-100" type="submit">
                  Submit request
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          {loading ? (
            <div className="text-center py-5">Loading your appointments...</div>
          ) : (
            <>
              <section className="mb-4">
                <h4 className="mb-3">Upcoming appointments</h4>
                {appointments.upcoming.length === 0 ? (
                  <p className="text-muted">No upcoming appointments yet.</p>
                ) : (
                  appointments.upcoming.map(renderAppointmentCard)
                )}
              </section>
              <section>
                <h4 className="mb-3">Past appointments</h4>
                {appointments.past.length === 0 ? (
                  <p className="text-muted">You have not attended any appointments yet.</p>
                ) : (
                  appointments.past.map(renderAppointmentCard)
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
