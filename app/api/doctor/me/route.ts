import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse } from "../../../lib/auth-helpers";

export async function GET() {
  const session = await requireRole(["DOCTOR"]);
  if (!session) return unauthorizedResponse();

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) return unauthorizedResponse();
  return NextResponse.json(doctor);
}

export async function PATCH(request: NextRequest) {
  const session = await requireRole(["DOCTOR"]);
  if (!session) return unauthorizedResponse();

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) return unauthorizedResponse();

  const body = await request.json();
  const { name, specialization, yearsOfExperience, availabilityJson } = body ?? {};
  if (
    yearsOfExperience !== undefined &&
    (typeof yearsOfExperience !== "number" || Number.isNaN(yearsOfExperience))
  ) {
    return badRequestResponse("yearsOfExperience must be a number");
  }

  const updated = await prisma.doctor.update({
    where: { id: doctor.id },
    data: {
      name: name ?? doctor.name,
      specialization: specialization ?? doctor.specialization,
      yearsOfExperience: yearsOfExperience ?? doctor.yearsOfExperience,
      availabilityJson: availabilityJson ?? doctor.availabilityJson,
    },
  });

  return NextResponse.json(updated);
}
