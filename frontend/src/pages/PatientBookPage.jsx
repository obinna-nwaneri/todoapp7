import { useEffect, useState } from "react";
import api from "../api/client";

const PatientBookPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctor: "", start_at: "", symptoms: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await api.get("/public/doctors");
      setDoctors(data.results ?? data);
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.symptoms.trim().length < 10) {
      setError("Symptoms must be at least 10 characters");
      return;
    }
    try {
      await api.post("/patient/appointments/", {
        doctor: form.doctor,
        start_at: form.start_at,
        symptoms: form.symptoms,
      });
      setSuccess("Appointment requested. Await approval.");
      setForm({ doctor: "", start_at: "", symptoms: "" });
    } catch (err) {
      setError(err.response?.data?.start_at?.[0] || err.response?.data?.symptoms?.[0] || "Booking failed");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold">Book Appointment</h2>
      {error && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded bg-green-100 p-3 text-sm text-green-700">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 rounded bg-white p-4 shadow">
        <label className="block text-sm font-medium text-gray-700">
          Doctor
          <select
            value={form.doctor}
            onChange={(e) => setForm((prev) => ({ ...prev, doctor: e.target.value }))}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.specialization}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Start time
          <input
            type="datetime-local"
            value={form.start_at}
            onChange={(e) => setForm((prev) => ({ ...prev, start_at: e.target.value }))}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Symptoms
          <textarea
            value={form.symptoms}
            onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
            rows="4"
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="rounded bg-blue-700 px-4 py-2 text-white">
          Submit Request
        </button>
      </form>
      <section>
        <h3 className="mb-2 text-lg font-semibold">Availability Reference</h3>
        <ul className="space-y-2">
          {doctors.map((doctor) => (
            <li key={doctor.id} className="rounded bg-white p-3 shadow">
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
              <p className="text-sm text-gray-500">
                Availability: {doctor.availability_rule.map((slot) => `Day ${slot.weekday} ${slot.start}-${slot.end}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PatientBookPage;
