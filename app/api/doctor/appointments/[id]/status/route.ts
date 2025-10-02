import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, notFound, badRequest, forbidden } from "@/lib/api-response";
import { Role, AppointmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const allowedStatuses = new Set<AppointmentStatus>([
  AppointmentStatus.APPROVED,
  AppointmentStatus.REJECTED,
  AppointmentStatus.COMPLETED
]);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await ensureRole(Role.DOCTOR);
  if (!sessionUser) return unauthorized();

  const doctor = await prisma.doctor.findUnique({ where: { userId: sessionUser.id } });
  if (!doctor) return unauthorized();

  const body = await request.json();
  const status = body?.status as AppointmentStatus | undefined;
  if (!status || !allowedStatuses.has(status)) {
    return badRequest("Invalid status transition");
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment) return notFound("Appointment not found");
  if (appointment.doctorId !== doctor.id) return forbidden();

  if (status === AppointmentStatus.COMPLETED && appointment.status !== AppointmentStatus.APPROVED) {
    return badRequest("Appointment must be approved before completion");
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status }
  });

  return NextResponse.json(updated);
}
