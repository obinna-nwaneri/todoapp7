import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function DoctorDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.DOCTOR) {
    redirect("/login");
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) {
    redirect("/login");
  }

  const upcoming = await prisma.appointment.findMany({
    where: {
      doctorId: doctor.id,
      date: { gte: new Date() },
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED] }
    },
    orderBy: { date: "asc" },
    take: 5,
    include: { patient: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {doctor.name}</h1>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Upcoming appointments</h2>
        <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
          {upcoming.length === 0 && <p className="p-4 text-sm text-slate-600">No upcoming appointments.</p>}
          {upcoming.map((appt) => (
            <div key={appt.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">{appt.patient.name}</p>
                <p className="text-sm text-slate-600">{appt.symptoms}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>{format(new Date(appt.date), "PP")}</p>
                <p>{appt.time}</p>
                <p className="uppercase tracking-wide text-slate-500">{appt.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
