"use client";

import { useRouter } from "next/navigation";

interface DoctorActionsProps {
  doctorId: string;
  name: string;
  specialization: string;
  yearsOfExperience: number;
}

export function DoctorActions({ doctorId, name, specialization, yearsOfExperience }: DoctorActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/admin/doctors/${doctorId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleEdit() {
    const nextName = prompt("Name", name) ?? name;
    const nextSpec = prompt("Specialization", specialization) ?? specialization;
    const nextYears = Number(prompt("Years of experience", String(yearsOfExperience)) ?? yearsOfExperience);
    await fetch(`/api/admin/doctors/${doctorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName, specialization: nextSpec, yearsOfExperience: nextYears })
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
