"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface DoctorOption {
  id: string;
  name: string;
  specialization: string;
}

interface BookAppointmentFormProps {
  doctors: DoctorOption[];
}

export function BookAppointmentForm({ doctors }: BookAppointmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: formData.get("doctorId"),
          date: formData.get("date"),
          time: formData.get("time"),
          symptoms: formData.get("symptoms")
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "Unable to book appointment");
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="doctor">
          Doctor
        </label>
        <select
          id="doctor"
          name="doctorId"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Select doctor
          </option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} • {doctor.specialization}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="date">
            Date
          </label>
          <input id="date" name="date" type="date" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="time">
            Time
          </label>
          <input id="time" name="time" type="time" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="symptoms">
          Describe symptoms
        </label>
        <textarea
          id="symptoms"
          name="symptoms"
          rows={4}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Share details to help your doctor prepare"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Booking..." : "Book appointment"}
      </button>
    </form>
  );
}
