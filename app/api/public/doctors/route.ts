import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { paginationSchema } from "../../../lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const specialization = searchParams.get("specialization") ?? undefined;
  const parsedPagination = paginationSchema.safeParse({
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "10",
    q,
  });
  if (!parsedPagination.success) {
    return NextResponse.json({ error: parsedPagination.error.message }, { status: 400 });
  }
  const { page, pageSize } = parsedPagination.data;
  const where = {
    ...(specialization ? { specialization: { contains: specialization, mode: "insensitive" as const } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { specialization: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
    }),
    prisma.doctor.count({ where }),
  ]);

  return NextResponse.json({ data, page, pageSize, total });
}
