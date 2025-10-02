import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, badRequest } from "@/lib/api-response";
import { buildPaginatedResponse, getPaginationParams } from "@/lib/pagination";
import { appointmentFiltersSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sessionUser = await ensureRole(Role.DOCTOR);
  if (!sessionUser) return unauthorized();

  const doctor = await prisma.doctor.findUnique({ where: { userId: sessionUser.id } });
  if (!doctor) return unauthorized();

  const { searchParams } = new URL(request.url);
  const { page, pageSize } = getPaginationParams(searchParams);
  const parsedFilters = appointmentFiltersSchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsedFilters.success) {
    return badRequest("Invalid filters", parsedFilters.error.flatten());
  }
  const filters = parsedFilters.data;

  const where: any = {
    doctorId: doctor.id,
    AND: [] as any[]
  };

  if (filters.status) where.AND.push({ status: filters.status });
  if (filters.startDate) where.AND.push({ date: { gte: new Date(filters.startDate) } });
  if (filters.endDate) where.AND.push({ date: { lte: new Date(filters.endDate) } });
  if (filters.q) {
    where.AND.push({
      OR: [
        { symptoms: { contains: filters.q, mode: "insensitive" } },
        { patient: { name: { contains: filters.q, mode: "insensitive" } } }
      ]
    });
  }

  const [count, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "asc" },
      include: { patient: true }
    })
  ]);

  return NextResponse.json(
    buildPaginatedResponse(
      appointments.map((appt) => ({
        id: appt.id,
        date: appt.date,
        time: appt.time,
        status: appt.status,
        symptoms: appt.symptoms,
        patient: { id: appt.patientId, name: appt.patient.name }
      })),
      count,
      page,
      pageSize
    )
  );
}
