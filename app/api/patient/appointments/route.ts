import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse } from "../../../lib/auth-helpers";
import { appointmentBookingSchema, paginationSchema } from "../../../lib/validators";

export async function GET(request: NextRequest) {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const pagination = paginationSchema.safeParse({
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "10",
    q,
  });
  if (!pagination.success) {
    return badRequestResponse(pagination.error.message);
  }
  const { page, pageSize } = pagination.data;

  const where: any = {
    patientId: patient.id,
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          startAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { symptoms: { contains: q, mode: "insensitive" as const } },
            { doctor: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { doctor: true },
      orderBy: { startAt: "desc" },
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({ data, page, pageSize, total });
}

export async function POST(request: NextRequest) {
  const session = await requireRole(["PATIENT"]);
  if (!session) return unauthorizedResponse();

  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) return unauthorizedResponse();

  const body = await request.json();
  const parsed = appointmentBookingSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(parsed.error.message);
  }

  const { doctorId, startAt, symptoms } = parsed.data;

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      patientId: patient.id,
      startAt,
      symptoms,
    },
    include: { doctor: true },
  });

  return NextResponse.json(appointment, { status: 201 });
}
