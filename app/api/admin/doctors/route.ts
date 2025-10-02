import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, badRequest } from "@/lib/api-response";
import { buildPaginatedResponse, getPaginationParams } from "@/lib/pagination";
import { registerDoctorSchema } from "@/lib/validation";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const { page, pageSize } = getPaginationParams(searchParams);
  const q = searchParams.get("q");

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { specialization: { contains: q, mode: "insensitive" } }
        ]
      }
    : {};

  const [count, doctors] = await Promise.all([
    prisma.doctor.count({ where }),
    prisma.doctor.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ]);

  return NextResponse.json(
    buildPaginatedResponse(
      doctors.map((doc) => ({
        id: doc.id,
        email: doc.user.email,
        name: doc.name,
        specialization: doc.specialization,
        yearsOfExperience: doc.yearsOfExperience,
        availabilitySchedule: doc.availabilitySchedule
      })),
      count,
      page,
      pageSize
    )
  );
}

export async function POST(request: Request) {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const body = await request.json();
  const parsed = registerDoctorSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { email, password, name, specialization, yearsOfExperience, availabilitySchedule } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return badRequest("Email already registered");
  }

  const hashedPassword = await hash(password, 10);
  const created = await prisma.user.create({
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

  return NextResponse.json({ id: created.doctor?.id, email: created.email }, { status: 201 });
}
