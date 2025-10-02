import { CreateDoctorForm } from "@/components/admin/create-doctor-form";
import { DoctorActions } from "@/components/admin/doctor-actions";
import { PaginatedTable } from "@/components/ui/paginated-table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function AdminDoctorsPage({ searchParams }: PageProps) {
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
          { specialization: { contains: q, mode: "insensitive" } }
        ]
      }
    : {};

  const [count, doctors] = await Promise.all([
    prisma.doctor.count({ where }),
    prisma.doctor.findMany({
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
    { key: "specialization", header: "Specialization" },
    { key: "yearsOfExperience", header: "Experience" },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <DoctorActions
          doctorId={row.id}
          name={row.name}
          specialization={row.specialization}
          yearsOfExperience={row.yearsOfExperience}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
        <p className="text-sm text-slate-600">Search, create, and manage doctor accounts.</p>
      </div>
      <form className="flex items-center gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or specialization"
          className="w-full max-w-sm rounded border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
          Search
        </button>
      </form>
      <CreateDoctorForm />
      <PaginatedTable
        columns={columns}
        data={doctors.map((doc) => ({
          id: doc.id,
          name: doc.name,
          email: doc.user.email,
          specialization: doc.specialization,
          yearsOfExperience: doc.yearsOfExperience
        }))}
        page={page}
        pageSize={pageSize}
        count={count}
      />
    </div>
  );
}
