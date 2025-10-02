import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";
import { registerDoctorSchema } from "../../../lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email, password, name, specialization, yearsOfExperience } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const doctor = await prisma.doctor.create({
    data: {
      name,
      specialization,
      yearsOfExperience,
      user: {
        create: {
          email: email.toLowerCase(),
          password: hashed,
          role: "DOCTOR",
        },
      },
    },
  });

  return NextResponse.json(doctor, { status: 201 });
}
