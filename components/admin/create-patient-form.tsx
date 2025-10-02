"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CreatePatientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          name: formData.get("name"),
          age: Number(formData.get("age")),
          gender: formData.get("gender"),
          contactInfo: {}
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Unable to create patient");
      }
      event.currentTarget.reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
      <input name="email" type="email" placeholder="Email" className="rounded border border-slate-300 px-3 py-2" required />
      <input
        name="password"
        type="password"
        minLength={8}
        placeholder="Temp password"
        className="rounded border border-slate-300 px-3 py-2"
        required
      />
      <input name="name" placeholder="Name" className="rounded border border-slate-300 px-3 py-2" required />
      <input name="gender" placeholder="Gender" className="rounded border border-slate-300 px-3 py-2" required />
      <input
        name="age"
        type="number"
        min={0}
        placeholder="Age"
        className="rounded border border-slate-300 px-3 py-2"
        required
      />
      <div className="md:col-span-5 flex items-center justify-between">
        <button type="submit" disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Saving..." : "Create Patient"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
