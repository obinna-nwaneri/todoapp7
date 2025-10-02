import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, notFound, badRequest } from "@/lib/api-response";
import { updateAppointmentSchema } from "@/lib/validation";
import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: true, patient: true }
  });

  if (!appointment) return notFound("Appointment not found");

  return NextResponse.json(appointment);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const body = await request.json();
  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { doctorId, patientId, date, time, symptoms, status } = parsed.data;

  try {
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        doctorId: doctorId ?? undefined,
        patientId: patientId ?? undefined,
        date: date ? new Date(date) : undefined,
        time: time ?? undefined,
        symptoms: symptoms ?? undefined,
        status: status ?? undefined
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return badRequest("Selected slot is no longer available");
    }
    throw error;
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  await prisma.appointment.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
