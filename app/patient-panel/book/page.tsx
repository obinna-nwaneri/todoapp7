import { BookAppointmentForm } from "@/components/patient/book-appointment-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function BookAppointmentPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PATIENT) {
    redirect("/login");
  }

  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Book appointment</h1>
        <p className="text-sm text-slate-600">Select a doctor and share symptoms to reserve your visit.</p>
      </div>
      <BookAppointmentForm doctors={doctors.map((doctor) => ({ id: doctor.id, name: doctor.name, specialization: doctor.specialization }))} />
    </div>
  );
}
