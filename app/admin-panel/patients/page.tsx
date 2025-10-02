import { CreatePatientForm } from "@/components/admin/create-patient-form";
import { PatientActions } from "@/components/admin/patient-actions";
import { PaginatedTable } from "@/components/ui/paginated-table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminPatientsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login");
  }

  const page = Number((Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) ?? "1");
  const pageSize = 10;
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { contactInfo: { path: ["phone"], string_contains: q } },
          { contactInfo: { path: ["email"], string_contains: q } }
        ]
      }
    : {};

  const [count, patients] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ]);

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "gender", header: "Gender" },
    { key: "age", header: "Age" },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <PatientActions patientId={row.id} name={row.name} age={row.age} gender={row.gender} />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
        <p className="text-sm text-slate-600">Maintain patient accounts and contact details.</p>
      </div>
      <form className="flex items-center gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or contact"
          className="w-full max-w-sm rounded border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
          Search
        </button>
      </form>
      <CreatePatientForm />
      <PaginatedTable
        columns={columns}
        data={patients.map((patient) => ({
          id: patient.id,
          name: patient.name,
          email: patient.user.email,
          gender: patient.gender,
          age: patient.age
        }))}
        page={page}
        pageSize={pageSize}
        count={count}
      />
    </div>
  );
}
