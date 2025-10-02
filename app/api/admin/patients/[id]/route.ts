import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, notFound, badRequest } from "@/lib/api-response";
import { updatePatientSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!patient) return notFound("Patient not found");

  return NextResponse.json({
    id: patient.id,
    email: patient.user.email,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    contactInfo: patient.contactInfo
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const body = await request.json();
  const parsed = updatePatientSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: parsed.data
  });

  return NextResponse.json(patient);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient) return notFound("Patient not found");

  await prisma.user.delete({ where: { id: patient.userId } });

  return NextResponse.json({ success: true });
}
