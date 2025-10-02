import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/stat-card";
import { AppointmentStatus, Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login");
  }

  const [doctors, patients, appointments, pending] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Doctors" value={doctors} />
        <StatCard title="Patients" value={patients} />
        <StatCard title="Appointments" value={appointments} />
        <StatCard title="Pending" value={pending} />
      </div>
    </div>
  );
}
