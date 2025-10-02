"use client";

import { useRouter } from "next/navigation";

interface PatientActionsProps {
  patientId: string;
  name: string;
  age: number;
  gender: string;
}

export function PatientActions({ patientId, name, age, gender }: PatientActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/admin/patients/${patientId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleEdit() {
    const nextName = prompt("Name", name) ?? name;
    const nextAge = Number(prompt("Age", String(age)) ?? age);
    const nextGender = prompt("Gender", gender) ?? gender;
    await fetch(`/api/admin/patients/${patientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName, age: nextAge, gender: nextGender })
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
