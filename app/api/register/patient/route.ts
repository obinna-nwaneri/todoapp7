import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";
import { registerPatientSchema } from "../../../lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerPatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email, password, name, age, gender, contactInfo } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const patient = await prisma.patient.create({
    data: {
      name,
      age,
      gender,
      contactInfo,
      user: {
        create: {
          email: email.toLowerCase(),
          password: hashed,
          role: "PATIENT",
        },
      },
    },
  });

  return NextResponse.json(patient, { status: 201 });
}
