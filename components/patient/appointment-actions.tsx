"use client";

import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

interface PatientAppointmentActionsProps {
  id: string;
  status: AppointmentStatus;
  doctorId: string;
  date: string;
  time: string;
  symptoms: string;
}

export function PatientAppointmentActions({ id, status, doctorId, date, time, symptoms }: PatientAppointmentActionsProps) {
  const router = useRouter();

  if (status !== AppointmentStatus.PENDING) {
    return <span className="text-xs text-slate-500">Locked</span>;
  }

  async function handleEdit() {
    const nextDate = prompt("New date (YYYY-MM-DD)", date.slice(0, 10)) ?? date.slice(0, 10);
    const nextTime = prompt("New time (HH:mm)", time) ?? time;
    const nextSymptoms = prompt("Symptoms", symptoms) ?? symptoms;
    await fetch(`/api/patient/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date: nextDate, time: nextTime, symptoms: nextSymptoms })
    });
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Cancel appointment?")) return;
    await fetch(`/api/patient/appointments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-sm">
      <button onClick={handleEdit} className="text-blue-600 hover:underline" type="button">
        Edit
      </button>
      <button onClick={handleCancel} className="text-red-600 hover:underline" type="button">
        Cancel
      </button>
    </div>
  );
}
