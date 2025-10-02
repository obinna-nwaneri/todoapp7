import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, badRequest } from "@/lib/api-response";
import { buildPaginatedResponse, getPaginationParams } from "@/lib/pagination";
import { appointmentFiltersSchema, bookAppointmentSchema } from "@/lib/validation";
import { AppointmentStatus, Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sessionUser = await ensureRole(Role.PATIENT);
  if (!sessionUser) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { userId: sessionUser.id } });
  if (!patient) return unauthorized();

  const { searchParams } = new URL(request.url);
  const { page, pageSize } = getPaginationParams(searchParams);
  const parsedFilters = appointmentFiltersSchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsedFilters.success) {
    return badRequest("Invalid filters", parsedFilters.error.flatten());
  }
  const filters = parsedFilters.data;

  const where: any = {
    patientId: patient.id,
    AND: [] as any[]
  };

  if (filters.status) where.AND.push({ status: filters.status });
  if (filters.startDate) where.AND.push({ date: { gte: new Date(filters.startDate) } });
  if (filters.endDate) where.AND.push({ date: { lte: new Date(filters.endDate) } });
  if (filters.q) {
    where.AND.push({
      OR: [
        { symptoms: { contains: filters.q, mode: "insensitive" } },
        { doctor: { name: { contains: filters.q, mode: "insensitive" } } }
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
      include: { doctor: true }
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
        doctor: { id: appt.doctorId, name: appt.doctor.name }
      })),
      count,
      page,
      pageSize
    )
  );
}

export async function POST(request: Request) {
  const sessionUser = await ensureRole(Role.PATIENT);
  if (!sessionUser) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { userId: sessionUser.id } });
  if (!patient) return unauthorized();

  const body = await request.json();
  const parsed = bookAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { doctorId, date, time, symptoms } = parsed.data;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: patient.id,
        date: new Date(date),
        time,
        symptoms,
        status: AppointmentStatus.PENDING
      }
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return badRequest("Selected slot is no longer available");
    }
    throw error;
  }
}
