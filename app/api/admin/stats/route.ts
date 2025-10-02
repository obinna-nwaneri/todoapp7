import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireRole, unauthorizedResponse } from "../../../lib/auth-helpers";

export async function GET() {
  const session = await requireRole(["ADMIN"]);
  if (!session) {
    return unauthorizedResponse();
  }

  const [doctors, patients, appointments, pending] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({ doctors, patients, appointments, pending });
}
