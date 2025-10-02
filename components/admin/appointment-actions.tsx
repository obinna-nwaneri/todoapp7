"use client";

import { useRouter } from "next/navigation";

interface AppointmentActionsProps {
  id: string;
  status: string;
}

export function AppointmentActions({ id, status }: AppointmentActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete appointment?")) return;
    await fetch(`/api/admin/appointments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleEdit() {
    const nextStatus = prompt("Status (PENDING/APPROVED/REJECTED/COMPLETED)", status) ?? status;
    const nextDate = prompt("Date (YYYY-MM-DD) leave blank to keep", "");
    const nextTime = prompt("Time (HH:mm) leave blank to keep", "");
    await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus || undefined,
        date: nextDate || undefined,
        time: nextTime || undefined
      })
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleEdit} className="text-sm text-blue-600 hover:underline" type="button">
        Edit
      </button>
      <button onClick={handleDelete} className="text-sm text-red-600 hover:underline" type="button">
        Delete
      </button>
    </div>
  );
}
