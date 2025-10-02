import { prisma } from "@/lib/prisma";
import { registerPatientSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerPatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, age, gender, contactInfo } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.PATIENT,
      patient: {
        create: {
          name,
          age,
          gender,
          contactInfo: contactInfo ?? {}
        }
      }
    },
    include: { patient: true }
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
