import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized, badRequest } from "@/lib/api-response";
import { buildPaginatedResponse, getPaginationParams } from "@/lib/pagination";
import { registerPatientSchema } from "@/lib/validation";
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
          { contactInfo: { path: ["phone"], string_contains: q } },
          { contactInfo: { path: ["email"], string_contains: q } }
        ]
      }
    : {};

  const [count, patients] = await Promise.all([
    prisma.patient.count({ where }),
    prisma.patient.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ]);

  return NextResponse.json(
    buildPaginatedResponse(
      patients.map((patient) => ({
        id: patient.id,
        email: patient.user.email,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        contactInfo: patient.contactInfo
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
  const parsed = registerPatientSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { email, password, name, age, gender, contactInfo } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return badRequest("Email already registered");
  }

  const hashedPassword = await hash(password, 10);

  const created = await prisma.user.create({
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

  return NextResponse.json({ id: created.patient?.id, email: created.email }, { status: 201 });
}
