"use client";

import { AppointmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

interface DoctorAppointmentActionsProps {
  id: string;
  currentStatus: AppointmentStatus;
}

export function DoctorAppointmentStatusActions({ id, currentStatus }: DoctorAppointmentActionsProps) {
  const router = useRouter();

  async function updateStatus(status: AppointmentStatus) {
    await fetch(`/api/doctor/appointments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-sm">
      {currentStatus === AppointmentStatus.PENDING && (
        <>
          <button onClick={() => updateStatus(AppointmentStatus.APPROVED)} className="text-green-600 hover:underline" type="button">
            Approve
          </button>
          <button onClick={() => updateStatus(AppointmentStatus.REJECTED)} className="text-red-600 hover:underline" type="button">
            Reject
          </button>
        </>
      )}
      {currentStatus === AppointmentStatus.APPROVED && (
        <button onClick={() => updateStatus(AppointmentStatus.COMPLETED)} className="text-blue-600 hover:underline" type="button">
          Mark completed
        </button>
      )}
    </div>
  );
}
