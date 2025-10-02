import { prisma } from "@/lib/prisma";
import { registerDoctorSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, specialization, yearsOfExperience, availabilitySchedule } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: Role.DOCTOR,
      doctor: {
        create: {
          name,
          specialization,
          yearsOfExperience,
          availabilitySchedule: availabilitySchedule ?? {}
        }
      }
    },
    include: { doctor: true }
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
