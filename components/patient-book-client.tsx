"use client";

import { useEffect, useState } from "react";
import { useToast } from "./use-toast";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
};

export default function PatientBookClient() {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [startAt, setStartAt] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  async function loadDoctors() {
    const params = new URLSearchParams({ page: "1", pageSize: "50" });
    if (query) params.set("q", query);
    const response = await fetch(`/api/public/doctors?${params.toString()}`);
    if (!response.ok) return;
    const json = await response.json();
    setDoctors(json.data);
  }

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/patient/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: selectedDoctor, startAt, symptoms }),
    });
    setLoading(false);
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Booking failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Appointment booked" });
    setSelectedDoctor("");
    setStartAt("");
    setSymptoms("");
  }

  return (
    <section>
      <h1>Book an Appointment</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input className="input" placeholder="Search doctors" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button className="button secondary" onClick={loadDoctors}>
          Search
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div className="form-field">
          <label htmlFor="doctor">Doctor</label>
          <select
            className="select"
            id="doctor"
            value={selectedDoctor}
            onChange={(event) => setSelectedDoctor(event.target.value)}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="startAt">Date &amp; time</label>
          <input
            className="input"
            id="startAt"
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="symptoms">Describe symptoms</label>
          <textarea
            className="textarea"
            id="symptoms"
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            minLength={10}
            required
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Booking..." : "Book appointment"}
        </button>
      </form>
    </section>
  );
}
