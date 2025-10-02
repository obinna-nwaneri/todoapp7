import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireRole, unauthorizedResponse, badRequestResponse } from "../../../lib/auth-helpers";
import { paginationSchema } from "../../../lib/validators";

export async function GET(request: NextRequest) {
  const session = await requireRole(["DOCTOR"]);
  if (!session) return unauthorizedResponse();

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
    doctor: { userId: session.user.id },
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
            { patient: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
  if (!doctor) return unauthorizedResponse();

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where: { ...where, doctorId: doctor.id },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { patient: true },
      orderBy: { startAt: "desc" },
    }),
    prisma.appointment.count({ where: { ...where, doctorId: doctor.id } }),
  ]);

  return NextResponse.json({ data, page, pageSize, total });
}
