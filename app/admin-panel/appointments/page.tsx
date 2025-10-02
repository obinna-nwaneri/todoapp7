import { CreateAppointmentForm } from "@/components/admin/create-appointment-form";
import { AppointmentActions } from "@/components/admin/appointment-actions";
import { PaginatedTable } from "@/components/ui/paginated-table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminAppointmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login");
  }

  const page = Number((Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) ?? "1");
  const pageSize = 10;
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const status = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const startDate = Array.isArray(searchParams.startDate) ? searchParams.startDate[0] : searchParams.startDate;
  const endDate = Array.isArray(searchParams.endDate) ? searchParams.endDate[0] : searchParams.endDate;

  const where: any = {
    AND: [] as any[]
  };

  if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    where.AND.push({ status });
  }
  if (q) {
    where.AND.push({
      OR: [
        { symptoms: { contains: q, mode: "insensitive" } },
        { doctor: { name: { contains: q, mode: "insensitive" } } },
        { patient: { name: { contains: q, mode: "insensitive" } } }
      ]
    });
  }
  if (startDate) {
    where.AND.push({ date: { gte: new Date(startDate) } });
  }
  if (endDate) {
    where.AND.push({ date: { lte: new Date(endDate) } });
  }

  const [count, appointments, doctors, patients] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "desc" },
      include: { doctor: true, patient: true }
    }),
    prisma.doctor.findMany({ orderBy: { name: "asc" } }),
    prisma.patient.findMany({ orderBy: { name: "asc" } })
  ]);

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (row: any) => format(new Date(row.date), "PP")
    },
    { key: "time", header: "Time" },
    { key: "doctor", header: "Doctor", render: (row: any) => row.doctor.name },
    { key: "patient", header: "Patient", render: (row: any) => row.patient.name },
    { key: "status", header: "Status" },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => <AppointmentActions id={row.id} status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
        <p className="text-sm text-slate-600">Track, create, and update all appointments.</p>
      </div>
      <form className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search symptoms or participants"
          className="rounded border border-slate-300 px-3 py-2"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded border border-slate-300 px-3 py-2">
          <option value="">All statuses</option>
          {Object.values(AppointmentStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input type="date" name="startDate" defaultValue={startDate ?? ""} className="rounded border border-slate-300 px-3 py-2" />
        <input type="date" name="endDate" defaultValue={endDate ?? ""} className="rounded border border-slate-300 px-3 py-2" />
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
          Apply
        </button>
      </form>
      <CreateAppointmentForm
        doctors={doctors.map((doc) => ({ id: doc.id, label: doc.name }))}
        patients={patients.map((patient) => ({ id: patient.id, label: patient.name }))}
      />
      <PaginatedTable
        columns={columns}
        data={appointments.map((appt) => ({
          id: appt.id,
          date: appt.date.toISOString(),
          time: appt.time,
          doctor: { name: appt.doctor.name },
          patient: { name: appt.patient.name },
          status: appt.status
        }))}
        page={page}
        pageSize={pageSize}
        count={count}
      />
    </div>
  );
}
