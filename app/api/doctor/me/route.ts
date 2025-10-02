import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, badRequest } from "@/lib/api-response";
import { updateDoctorSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionUser = await ensureRole(Role.DOCTOR);
  if (!sessionUser) return unauthorized();

  const doctor = await prisma.doctor.findUnique({ where: { userId: sessionUser.id } });
  if (!doctor) return unauthorized();

  return NextResponse.json(doctor);
}

export async function PATCH(request: Request) {
  const sessionUser = await ensureRole(Role.DOCTOR);
  if (!sessionUser) return unauthorized();

  const doctor = await prisma.doctor.findUnique({ where: { userId: sessionUser.id } });
  if (!doctor) return unauthorized();

  const body = await request.json();
  const parsed = updateDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const updated = await prisma.doctor.update({
    where: { id: doctor.id },
    data: parsed.data
  });

  return NextResponse.json(updated);
}
