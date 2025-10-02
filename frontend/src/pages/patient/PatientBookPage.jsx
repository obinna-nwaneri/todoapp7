import { useEffect, useState } from "react";
import api from "../../api/client";

export default function PatientBookPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ doctor: "", start_at: "", symptoms: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadDoctors = async (term = "") => {
    const { data } = await api.get("/public/doctors", { params: { search: term } });
    setDoctors(data);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.symptoms || form.symptoms.length < 10) {
      setError("Symptoms must be at least 10 characters");
      return;
    }
    try {
      await api.post("/patient/appointments/", {
        doctor: form.doctor,
        start_at: new Date(form.start_at).toISOString(),
        symptoms: form.symptoms,
      });
      setMessage("Appointment requested!");
      setForm({ doctor: "", start_at: "", symptoms: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to book appointment");
    }
  };

  return (
    <div>
      <h2>Book an Appointment</h2>
      {message ? <div className="success">{message}</div> : null}
      {error ? <div className="error">{error}</div> : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadDoctors(search);
        }}
        style={{ marginBottom: "1rem" }}
      >
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors" />
        <button className="btn-secondary" type="submit">
          Search
        </button>
      </form>

      <form onSubmit={handleSubmit} className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
        <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
          <option value="">Select doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
        <input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} required />
        <textarea
          placeholder="Describe symptoms"
          rows={4}
          value={form.symptoms}
          onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          required
        />
        <button className="btn-primary" type="submit">
          Submit Request
        </button>
      </form>
    </div>
  );
}
