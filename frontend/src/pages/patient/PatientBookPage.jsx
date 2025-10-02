import { useEffect, useState } from "react";

import apiClient from "../../api/client.js";

const PatientBookPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ doctor: "", date: "", time: "", symptoms: "" });
  const [success, setSuccess] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/public/doctors/", {
        params: { search },
      });
      setDoctors(data.results || data);
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to load doctors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (form.symptoms.length < 10) {
      setError({ detail: "Symptoms should be at least 10 characters." });
      return;
    }
    try {
      await apiClient.post("/patient/appointments/", {
        doctor: Number(form.doctor),
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
      });
      setSuccess("Appointment booked successfully.");
      setForm({ doctor: "", date: "", time: "", symptoms: "" });
    } catch (err) {
      setError(err.response?.data || { detail: "Unable to book appointment" });
    }
  };

  return (
    <div>
      <h2>Book an Appointment</h2>
      {success && <p className="success">{success}</p>}
      {error && <pre className="alert">{JSON.stringify(error, null, 2)}</pre>}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <input
          type="search"
          placeholder="Search doctors"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {loading ? (
          <p>Loading doctors...</p>
        ) : (
          <ul>
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                {doctor.name} – {doctor.specialization}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>
            Select Doctor
            <select
              name="doctor"
              value={form.doctor}
              onChange={(event) => setForm((prev) => ({ ...prev, doctor: event.target.value }))}
              required
            >
              <option value="">-- Choose a doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} – {doctor.specialization}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </label>
          <label>
            Time
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
              required
            />
          </label>
          <label>
            Symptoms
            <textarea
              name="symptoms"
              value={form.symptoms}
              onChange={(event) => setForm((prev) => ({ ...prev, symptoms: event.target.value }))}
              required
            />
          </label>
          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
};

export default PatientBookPage;
