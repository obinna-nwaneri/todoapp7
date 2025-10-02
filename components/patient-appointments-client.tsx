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
};

type ApiResponse = {
  data: Appointment[];
  page: number;
  pageSize: number;
  total: number;
};

export default function PatientAppointmentsClient() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

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
    const response = await fetch(`/api/patient/appointments?${query.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      showToast({ type: "error", title: "Failed to load appointments", description: await response.text() });
      return;
    }
    setData(await response.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function cancel(id: string) {
    const response = await fetch(`/api/patient/appointments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Cancel failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Appointment cancelled" });
    load();
  }

  return (
    <section>
      <h1>My Appointments</h1>
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
              <td>{new Date(appointment.startAt).toLocaleString()}</td>
              <td>{appointment.status}</td>
              <td>{appointment.symptoms}</td>
              <td>
                {appointment.status === "PENDING" ? (
                  <button className="button danger" onClick={() => cancel(appointment.id)}>
                    Cancel
                  </button>
                ) : null}
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
    </section>
  );
}
