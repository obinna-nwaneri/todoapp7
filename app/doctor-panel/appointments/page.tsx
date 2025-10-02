import { PaginatedTable } from "@/components/ui/paginated-table";
import { DoctorAppointmentStatusActions } from "@/components/doctor/appointment-status-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Role } from "@prisma/client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DoctorAppointmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.DOCTOR) {
    redirect("/login");
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) redirect("/login");

  const page = Number((Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) ?? "1");
  const pageSize = 10;
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const status = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;

  const where: any = {
    doctorId: doctor.id,
    AND: [] as any[]
  };

  if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    where.AND.push({ status });
  }
  if (q) {
    where.AND.push({
      OR: [
        { symptoms: { contains: q, mode: "insensitive" } },
        { patient: { name: { contains: q, mode: "insensitive" } } }
      ]
    });
  }

  const [count, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "desc" },
      include: { patient: true }
    })
  ]);

  const columns = [
    { key: "date", header: "Date", render: (row: any) => format(new Date(row.date), "PP") },
    { key: "time", header: "Time" },
    { key: "patient", header: "Patient", render: (row: any) => row.patient.name },
    { key: "symptoms", header: "Symptoms" },
    { key: "status", header: "Status" },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => <DoctorAppointmentStatusActions id={row.id} currentStatus={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by patient or symptom"
          className="w-full max-w-xs rounded border border-slate-300 px-3 py-2"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded border border-slate-300 px-3 py-2">
          <option value="">All statuses</option>
          {Object.values(AppointmentStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
          Filter
        </button>
      </form>
      <PaginatedTable
        columns={columns}
        data={appointments.map((appt) => ({
          id: appt.id,
          date: appt.date.toISOString(),
          time: appt.time,
          patient: { name: appt.patient.name },
          symptoms: appt.symptoms,
          status: appt.status
        }))}
        page={page}
        pageSize={pageSize}
        count={count}
      />
    </div>
  );
}
