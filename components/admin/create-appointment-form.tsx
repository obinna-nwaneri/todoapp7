"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  label: string;
}

interface CreateAppointmentFormProps {
  doctors: Option[];
  patients: Option[];
}

export function CreateAppointmentForm({ doctors, patients }: CreateAppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: formData.get("doctorId"),
          patientId: formData.get("patientId"),
          date: formData.get("date"),
          time: formData.get("time"),
          symptoms: formData.get("symptoms")
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? "Unable to create appointment");
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
    <form onSubmit={handleSubmit} className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
      <select name="doctorId" className="rounded border border-slate-300 px-3 py-2" required defaultValue="">
        <option value="" disabled>
          Select doctor
        </option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.label}
          </option>
        ))}
      </select>
      <select name="patientId" className="rounded border border-slate-300 px-3 py-2" required defaultValue="">
        <option value="" disabled>
          Select patient
        </option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.label}
          </option>
        ))}
      </select>
      <input name="date" type="date" className="rounded border border-slate-300 px-3 py-2" required />
      <input name="time" type="time" className="rounded border border-slate-300 px-3 py-2" required />
      <input name="symptoms" placeholder="Symptoms" className="rounded border border-slate-300 px-3 py-2 md:col-span-2" required />
      <div className="md:col-span-6 flex items-center justify-between">
        <button type="submit" disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Saving..." : "Create Appointment"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
