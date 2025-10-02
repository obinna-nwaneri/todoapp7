import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";
import { registerPatientSchema, paginationSchema } from "../../../lib/validators";
import { requireRole, unauthorizedResponse, badRequestResponse } from "../../../lib/auth-helpers";

export async function GET(request: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const pagination = paginationSchema.safeParse({
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "10",
    q,
  });
  if (!pagination.success) {
    return badRequestResponse(pagination.error.message);
  }
  const { page, pageSize } = pagination.data;
  const where =
    q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { contactInfo: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

  const [data, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: true },
      orderBy: { name: "asc" },
    }),
    prisma.patient.count({ where }),
  ]);

  return NextResponse.json({ data, page, pageSize, total });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return unauthorizedResponse();

  const body = await request.json();
  const parsed = registerPatientSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.message);
  }
  const { email, password, name, age, gender, contactInfo } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return badRequestResponse("Email already exists");
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
    include: { user: true },
  });

  return NextResponse.json(patient, { status: 201 });
}
