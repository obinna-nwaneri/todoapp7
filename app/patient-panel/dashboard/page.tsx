import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PATIENT) {
    redirect("/login");
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) redirect("/login");

  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: patient.id, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: { doctor: true }
    }),
    prisma.appointment.findMany({
      where: { patientId: patient.id, date: { lt: now } },
      orderBy: { date: "desc" },
      take: 5,
      include: { doctor: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Hello, {patient.name}</h1>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Upcoming appointments</h2>
        <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
          {upcoming.length === 0 && <p className="p-4 text-sm text-slate-600">No upcoming appointments scheduled.</p>}
          {upcoming.map((appt) => (
            <div key={appt.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">{appt.doctor.name}</p>
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
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Recent visits</h2>
        <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
          {past.length === 0 && <p className="p-4 text-sm text-slate-600">No previous appointments.</p>}
          {past.map((appt) => (
            <div key={appt.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">{appt.doctor.name}</p>
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
