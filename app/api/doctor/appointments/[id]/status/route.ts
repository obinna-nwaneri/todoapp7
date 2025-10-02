import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse, notFoundResponse } from "../../../../../lib/auth-helpers";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["DOCTOR"]);
  if (!session) return unauthorizedResponse();

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) return unauthorizedResponse();

  const body = await request.json();
  const { status } = body ?? {};
  if (!status || !["APPROVED", "REJECTED", "COMPLETED"].includes(status)) {
    return badRequestResponse("Invalid status");
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment || appointment.doctorId !== doctor.id) {
    return notFoundResponse();
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status },
    include: { patient: true },
  });

  return NextResponse.json(updated);
}
