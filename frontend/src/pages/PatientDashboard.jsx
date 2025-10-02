import { useEffect, useState } from "react";
import { apiRequest, endpoints } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  doctor_id: "",
  date: "",
  time: "",
  symptoms: ""
};

const PatientDashboard = () => {
  const { tokens } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [doctorList, upcomingList, historyList] = await Promise.all([
        apiRequest(endpoints.doctors, { token: tokens.access }),
        apiRequest(endpoints.upcomingAppointments, { token: tokens.access }),
        apiRequest(endpoints.pastAppointments, { token: tokens.access })
      ]);
      setDoctors(doctorList);
      setUpcoming(upcomingList);
      setHistory(historyList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokens?.access) {
      fetchData();
    }
  }, [tokens]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await apiRequest(endpoints.appointments, {
        method: "POST",
        token: tokens.access,
        body: {
          doctor_id: form.doctor_id,
          date: form.date,
          time: form.time,
          symptoms: form.symptoms
        }
      });
      setSuccess("Appointment request submitted successfully.");
      setForm(emptyForm);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Patient Dashboard</h2>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Book an appointment</h5>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Doctor</label>
                  <select
                    className="form-select"
                    name="doctor_id"
                    value={form.doctor_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Symptoms</label>
                  <textarea
                    className="form-control"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button className="btn btn-primary w-100" type="submit">
                  Submit request
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="mb-4">
            <h5>Upcoming appointments</h5>
            {loading ? (
              <div>Loading...</div>
            ) : upcoming.length === 0 ? (
              <div className="alert alert-info">No upcoming appointments.</div>
            ) : (
              <ul className="list-group">
                {upcoming.map((item) => (
                  <li key={item.id} className="list-group-item d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{item.doctor.name}</h6>
                      <small className="text-muted">
                        {item.date} at {item.time}
                      </small>
                      <p className="mb-1">Status: {item.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h5>Past appointments</h5>
            {loading ? (
              <div>Loading...</div>
            ) : history.length === 0 ? (
              <div className="alert alert-secondary">No past appointments yet.</div>
            ) : (
              <ul className="list-group">
                {history.map((item) => (
                  <li key={item.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{item.doctor.name}</h6>
                        <small className="text-muted">
                          {item.date} at {item.time}
                        </small>
                        <p className="mb-1">Symptoms: {item.symptoms}</p>
                      </div>
                      <span className={`badge bg-${item.status === "Approved" ? "success" : item.status === "Rejected" ? "danger" : "warning"}`}>
                        {item.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
