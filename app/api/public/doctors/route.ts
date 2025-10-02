import { prisma } from "@/lib/prisma";
import { buildPaginatedResponse, getPaginationParams } from "@/lib/pagination";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = getPaginationParams(searchParams);
  const q = searchParams.get("q");
  const specialization = searchParams.get("specialization");

  const where = {
    AND: [
      specialization ? { specialization: { contains: specialization, mode: "insensitive" } } : {},
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { specialization: { contains: q, mode: "insensitive" } }
            ]
          }
        : {}
    ]
  };

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
        name: doc.name,
        specialization: doc.specialization,
        yearsOfExperience: doc.yearsOfExperience,
        email: doc.user.email
      })),
      count,
      page,
      pageSize
    )
  );
}
