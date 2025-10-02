import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, badRequest } from "@/lib/api-response";
import { updatePatientSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionUser = await ensureRole(Role.PATIENT);
  if (!sessionUser) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { userId: sessionUser.id } });
  if (!patient) return unauthorized();

  return NextResponse.json(patient);
}

export async function PATCH(request: Request) {
  const sessionUser = await ensureRole(Role.PATIENT);
  if (!sessionUser) return unauthorized();

  const patient = await prisma.patient.findUnique({ where: { userId: sessionUser.id } });
  if (!patient) return unauthorized();

  const body = await request.json();
  const parsed = updatePatientSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const updated = await prisma.patient.update({
    where: { id: patient.id },
    data: parsed.data
  });

  return NextResponse.json(updated);
}
