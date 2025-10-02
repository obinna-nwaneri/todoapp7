import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse, notFoundResponse } from "../../../../lib/auth-helpers";
import { registerPatientSchema } from "../../../../lib/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!patient) return notFoundResponse();
  return NextResponse.json(patient);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = registerPatientSchema.partial({ password: true }).safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.message);
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!patient) return notFoundResponse();

  const { email, password, name, age, gender, contactInfo } = parsed.data;
  if (email && email.toLowerCase() !== patient.user.email) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return badRequestResponse("Email already exists");
  }

  const updated = await prisma.patient.update({
    where: { id: params.id },
    data: {
      name: name ?? patient.name,
      age: age ?? patient.age,
      gender: gender ?? patient.gender,
      contactInfo: contactInfo ?? patient.contactInfo,
      user: {
        update: {
          email: email ? email.toLowerCase() : patient.user.email,
          ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
        },
      },
    },
    include: { user: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  await prisma.patient.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
