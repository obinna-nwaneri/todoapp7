"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "./use-toast";

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"] as const;

type Appointment = {
  id: string;
  startAt: string;
  status: string;
  symptoms: string;
  doctor: { name: string };
  patient: { name: string };
};

type ApiResponse = {
  data: Appointment[];
  page: number;
  pageSize: number;
  total: number;
};

const initialForm = {
  id: "",
  doctorId: "",
  patientId: "",
  startAt: "",
  symptoms: "",
  status: "PENDING",
};

export default function AdminAppointmentsClient() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  async function load() {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (search) query.set("q", search);
    if (status) query.set("status", status);
    if (from) query.set("from", new Date(from).toISOString());
    if (to) query.set("to", new Date(to).toISOString());
    const response = await fetch(`/api/admin/appointments?${query.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      showToast({ type: "error", title: "Failed to load appointments", description: await response.text() });
      return;
    }
    setData(await response.json());
  }

  async function loadOptions() {
    const [doctorsRes, patientsRes] = await Promise.all([
      fetch("/api/admin/doctors?page=1&pageSize=50"),
      fetch("/api/admin/patients?page=1&pageSize=50"),
    ]);
    if (doctorsRes.ok) {
      const json = await doctorsRes.json();
      setDoctors(json.data.map((d: any) => ({ id: d.id, name: d.name })));
    }
    if (patientsRes.ok) {
      const json = await patientsRes.json();
      setPatients(json.data.map((p: any) => ({ id: p.id, name: p.name })));
    }
  }

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const payload = {
      doctorId: form.doctorId,
      patientId: form.patientId,
      startAt: form.startAt,
      symptoms: form.symptoms,
      status: form.status,
    };
    const url = form.id ? `/api/admin/appointments/${form.id}` : "/api/admin/appointments";
    const method = form.id ? "PATCH" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Save failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Appointment saved" });
    setForm(initialForm);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this appointment?")) return;
    const response = await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Delete failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Appointment removed" });
    load();
  }

  function startEdit(appointment: Appointment) {
    setForm({
      id: appointment.id,
      doctorId: doctors.find((d) => d.name === appointment.doctor.name)?.id ?? "",
      patientId: patients.find((p) => p.name === appointment.patient.name)?.id ?? "",
      startAt: appointment.startAt.slice(0, 16),
      symptoms: appointment.symptoms,
      status: appointment.status,
    });
  }

  return (
    <section>
      <h1>Appointments</h1>
      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "1rem" }}>
        <input className="input" placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input className="input" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input className="input" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <button className="button secondary" onClick={() => { setPage(1); load(); }}>
          Apply
        </button>
      </div>
      {loading ? <p>Loading...</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Start</th>
            <th>Status</th>
            <th>Symptoms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.doctor.name}</td>
              <td>{appointment.patient.name}</td>
              <td>{new Date(appointment.startAt).toLocaleString()}</td>
              <td>{appointment.status}</td>
              <td>{appointment.symptoms}</td>
              <td>
                <button className="button secondary" onClick={() => startEdit(appointment)}>
                  Edit
                </button>
                <button className="button danger" onClick={() => handleDelete(appointment.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button className="button secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="button secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
      <h2 style={{ marginTop: "2rem" }}>{form.id ? "Edit appointment" : "Create appointment"}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div className="form-field">
          <label htmlFor="doctorId">Doctor</label>
          <select
            className="select"
            id="doctorId"
            name="doctorId"
            value={form.doctorId}
            onChange={(event) => setForm((prev) => ({ ...prev, doctorId: event.target.value }))}
            required
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="patientId">Patient</label>
          <select
            className="select"
            id="patientId"
            name="patientId"
            value={form.patientId}
            onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
            required
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="startAt">Start date & time</label>
          <input
            className="input"
            id="startAt"
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={(event) => setForm((prev) => ({ ...prev, startAt: event.target.value }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="symptoms">Symptoms</label>
          <textarea
            className="textarea"
            id="symptoms"
            name="symptoms"
            value={form.symptoms}
            onChange={(event) => setForm((prev) => ({ ...prev, symptoms: event.target.value }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            className="select"
            id="status"
            name="status"
            value={form.status}
            onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
          {form.id ? (
            <button className="button secondary" type="button" onClick={() => setForm(initialForm)}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
