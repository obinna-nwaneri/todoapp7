"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "./use-toast";

type PatientWithUser = {
  id: string;
  name: string;
  age: number;
  gender: string;
  contactInfo?: string | null;
  user: { email: string };
};

type ApiResponse = {
  data: PatientWithUser[];
  page: number;
  pageSize: number;
  total: number;
};

const initialForm = {
  id: "",
  name: "",
  age: 0,
  gender: "",
  contactInfo: "",
  email: "",
  password: "",
};

export default function AdminPatientsClient() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  async function load() {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (search) query.set("q", search);
    const response = await fetch(`/api/admin/patients?${query.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      showToast({ type: "error", title: "Failed to load patients", description: await response.text() });
      return;
    }
    setData(await response.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const payload = {
      email: form.email,
      password: form.id ? undefined : form.password,
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      contactInfo: form.contactInfo || undefined,
    };
    const url = form.id ? `/api/admin/patients/${form.id}` : "/api/admin/patients";
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
    showToast({ type: "success", title: "Patient saved" });
    setForm(initialForm);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this patient?")) return;
    const response = await fetch(`/api/admin/patients/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Delete failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Patient removed" });
    load();
  }

  function startEdit(patient: PatientWithUser) {
    setForm({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contactInfo: patient.contactInfo ?? "",
      email: patient.user.email,
      password: "",
    });
  }

  return (
    <section>
      <h1>Patients</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          className="input"
          placeholder="Search patients"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="button secondary" onClick={() => { setPage(1); load(); }}>
          Search
        </button>
      </div>
      {loading ? <p>Loading...</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.gender}</td>
              <td>{patient.contactInfo ?? "-"}</td>
              <td>{patient.user.email}</td>
              <td>
                <button className="button secondary" onClick={() => startEdit(patient)}>
                  Edit
                </button>
                <button className="button danger" onClick={() => handleDelete(patient.id)}>
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
      <h2 style={{ marginTop: "2rem" }}>{form.id ? "Edit patient" : "Create patient"}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            className="input"
            id="name"
            name="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="age">Age</label>
          <input
            className="input"
            id="age"
            name="age"
            type="number"
            min={0}
            value={form.age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="gender">Gender</label>
          <input
            className="input"
            id="gender"
            name="gender"
            value={form.gender}
            onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="contactInfo">Contact info</label>
          <input
            className="input"
            id="contactInfo"
            name="contactInfo"
            value={form.contactInfo}
            onChange={(event) => setForm((prev) => ({ ...prev, contactInfo: event.target.value }))}
          />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>
        {!form.id ? (
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </div>
        ) : null}
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
