"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "./use-toast";

type DoctorWithUser = {
  id: string;
  name: string;
  specialization: string;
  yearsOfExperience: number;
  user: { email: string };
};

type ApiResponse = {
  data: DoctorWithUser[];
  page: number;
  pageSize: number;
  total: number;
};

const initialForm = {
  id: "",
  name: "",
  specialization: "",
  yearsOfExperience: 0,
  email: "",
  password: "",
};

export default function AdminDoctorsClient() {
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
    const response = await fetch(`/api/admin/doctors?${query.toString()}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) {
      showToast({ type: "error", title: "Failed to load doctors", description: await response.text() });
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
      specialization: form.specialization,
      yearsOfExperience: Number(form.yearsOfExperience),
    };
    const url = form.id ? `/api/admin/doctors/${form.id}` : "/api/admin/doctors";
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
    showToast({ type: "success", title: "Doctor saved" });
    setForm(initialForm);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this doctor?")) return;
    const response = await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      showToast({ type: "error", title: "Delete failed", description: error.error });
      return;
    }
    showToast({ type: "success", title: "Doctor removed" });
    load();
  }

  function startEdit(doctor: DoctorWithUser) {
    setForm({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      yearsOfExperience: doctor.yearsOfExperience,
      email: doctor.user.email,
      password: "",
    });
  }

  return (
    <section>
      <h1>Doctors</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          className="input"
          placeholder="Search doctors"
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
            <th>Specialization</th>
            <th>Experience</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.name}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.yearsOfExperience} years</td>
              <td>{doctor.user.email}</td>
              <td>
                <button className="button secondary" onClick={() => startEdit(doctor)}>
                  Edit
                </button>
                <button className="button danger" onClick={() => handleDelete(doctor.id)}>
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
      <h2 style={{ marginTop: "2rem" }}>{form.id ? "Edit doctor" : "Create doctor"}</h2>
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
          <label htmlFor="specialization">Specialization</label>
          <input
            className="input"
            id="specialization"
            name="specialization"
            value={form.specialization}
            onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="yearsOfExperience">Years of experience</label>
          <input
            className="input"
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={0}
            value={form.yearsOfExperience}
            onChange={(event) => setForm((prev) => ({ ...prev, yearsOfExperience: Number(event.target.value) }))}
            required
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
            <button
              className="button secondary"
              type="button"
              onClick={() => setForm(initialForm)}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
