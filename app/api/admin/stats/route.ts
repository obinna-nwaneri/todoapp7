import { prisma } from "@/lib/prisma";
import { ensureRole } from "@/lib/role-guard";
import { unauthorized } from "@/lib/api-response";
import { Role, AppointmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await ensureRole(Role.ADMIN);
  if (!user) return unauthorized();

  const [doctors, patients, appointments, pending] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } })
  ]);

  return NextResponse.json({ doctors, patients, appointments, pending });
}
