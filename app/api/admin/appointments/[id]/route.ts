import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse, notFoundResponse } from "../../../../lib/auth-helpers";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: true, patient: true },
  });
  if (!appointment) return notFoundResponse();
  return NextResponse.json(appointment);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const { startAt, symptoms, status } = body ?? {};
  const updateData: any = {};
  if (startAt) {
    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) {
      return badRequestResponse("Invalid date");
    }
    updateData.startAt = start;
  }
  if (symptoms) updateData.symptoms = symptoms;
  if (status) updateData.status = status;

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: updateData,
    include: { doctor: true, patient: true },
  });

  return NextResponse.json(appointment);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
