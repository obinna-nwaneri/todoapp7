import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse } from "../../../lib/auth-helpers";

export async function GET() {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();
  return NextResponse.json(patient);
}

export async function PATCH(request: NextRequest) {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();

  const body = await request.json();
  const { name, age, gender, contactInfo } = body ?? {};
  if (age !== undefined && (typeof age !== "number" || Number.isNaN(age))) {
    return badRequestResponse("age must be a number");
  }

  const updated = await prisma.patient.update({
    where: { id: patient.id },
    data: {
      name: name ?? patient.name,
      age: age ?? patient.age,
      gender: gender ?? patient.gender,
      contactInfo: contactInfo ?? patient.contactInfo,
    },
  });

  return NextResponse.json(updated);
}
