import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, notFound, badRequest } from "@/lib/api-response";
import { updateDoctorSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const doctor = await prisma.doctor.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!doctor) return notFound("Doctor not found");

  return NextResponse.json({
    id: doctor.id,
    email: doctor.user.email,
    name: doctor.name,
    specialization: doctor.specialization,
    yearsOfExperience: doctor.yearsOfExperience,
    availabilitySchedule: doctor.availabilitySchedule
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const body = await request.json();
  const parsed = updateDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const doctor = await prisma.doctor.update({
    where: { id: params.id },
    data: parsed.data
  });

  return NextResponse.json(doctor);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
  if (!doctor) return notFound("Doctor not found");

  await prisma.user.delete({ where: { id: doctor.userId } });

  return NextResponse.json({ success: true });
}
