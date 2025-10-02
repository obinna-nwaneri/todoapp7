import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse, notFoundResponse } from "../../../../lib/auth-helpers";
import { appointmentUpdateSchema } from "../../../../lib/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: true },
  });
  if (!appointment || appointment.patientId !== patient.id) {
    return notFoundResponse();
  }
  return NextResponse.json(appointment);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment || appointment.patientId !== patient.id) {
    return notFoundResponse();
  }

  if (appointment.status !== "PENDING") {
    return badRequestResponse("Only pending appointments can be updated");
  }

  const body = await request.json();
  const parsed = appointmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.message);
  }

  const { startAt, symptoms } = parsed.data;

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      ...(startAt ? { startAt } : {}),
      ...(symptoms ? { symptoms } : {}),
    },
    include: { doctor: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment || appointment.patientId !== patient.id) {
    return notFoundResponse();
  }
  if (appointment.status !== "PENDING") {
    return badRequestResponse("Only pending appointments can be cancelled");
  }

  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
