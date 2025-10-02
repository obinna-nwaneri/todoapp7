import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse, notFoundResponse } from "../../../../lib/auth-helpers";
import { registerDoctorSchema } from "../../../../lib/validators";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const doctor = await prisma.doctor.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!doctor) return notFoundResponse();

  return NextResponse.json(doctor);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = registerDoctorSchema.partial({ password: true }).safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.message);
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: params.id }, include: { user: true } });
  if (!doctor) return notFoundResponse();

  const { email, password, name, specialization, yearsOfExperience } = parsed.data;

  if (email && email.toLowerCase() !== doctor.user.email) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return badRequestResponse("Email already exists");
    }
  }

  const updated = await prisma.doctor.update({
    where: { id: params.id },
    data: {
      name: name ?? doctor.name,
      specialization: specialization ?? doctor.specialization,
      yearsOfExperience: yearsOfExperience ?? doctor.yearsOfExperience,
      user: {
        update: {
          email: email ? email.toLowerCase() : doctor.user.email,
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

  await prisma.doctor.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
