import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, forbidden, badRequest, notFound } from "@/lib/api-response";
import { bookAppointmentSchema } from "@/lib/validation";
import { AppointmentStatus, Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await ensureRole(Role.PATIENT);
  if (!sessionUser) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { userId: sessionUser.id } });
  if (!patient) return unauthorized();

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment) return notFound("Appointment not found");
  if (appointment.patientId !== patient.id) return forbidden();
  if (appointment.status !== AppointmentStatus.PENDING) {
    return badRequest("Only pending appointments can be updated");
  }

  const body = await request.json();
  const parsed = bookAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { doctorId, date, time, symptoms } = parsed.data;

  try {
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        doctorId,
        date: new Date(date),
        time,
        symptoms
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return badRequest("Selected slot is no longer available");
    }
    throw error;
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const sessionUser = await ensureRole(Role.PATIENT);
  if (!sessionUser) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { userId: sessionUser.id } });
  if (!patient) return unauthorized();

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment) return notFound("Appointment not found");
  if (appointment.patientId !== patient.id) return forbidden();
  if (appointment.status !== AppointmentStatus.PENDING) {
    return badRequest("Only pending appointments can be cancelled");
  }

  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
