"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterPatientForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: 0,
    gender: "",
    contactInfo: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let contact: any = {};
      if (form.contactInfo) {
        try {
          contact = JSON.parse(form.contactInfo);
        } catch {
          throw new Error("Contact info must be valid JSON");
        }
      }

      const response = await fetch("/api/auth/register/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          contactInfo: contact
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Registration failed");
      }

      setSuccess("Registration successful! You can now sign in.");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="age">
            Age
          </label>
          <input
            id="age"
            type="number"
            min={0}
            value={form.age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="gender">
            Gender
          </label>
          <input
            id="gender"
            value={form.gender}
            onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="contact">
            Contact Info (JSON)
          </label>
          <textarea
            id="contact"
            value={form.contactInfo}
            onChange={(event) => setForm((prev) => ({ ...prev, contactInfo: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            rows={4}
            placeholder='{"phone": "555-0100"}'
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button type="submit" disabled={loading} className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Registering..." : "Register Patient"}
      </button>
    </form>
  );
}
