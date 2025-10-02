import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const doctorPassword = await bcrypt.hash("doctor123", 10);
  const patientPassword = await bcrypt.hash("patient123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor1@example.com" },
    update: {},
    create: {
      email: "doctor1@example.com",
      password: doctorPassword,
      role: Role.DOCTOR,
      doctor: {
        create: {
          name: "Dr. John Doe",
          specialization: "Cardiology",
          yearsOfExperience: 10,
        },
      },
    },
    include: { doctor: true },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient1@example.com" },
    update: {},
    create: {
      email: "patient1@example.com",
      password: patientPassword,
      role: Role.PATIENT,
      patient: {
        create: {
          name: "Jane Patient",
          age: 32,
          gender: "Female",
        },
      },
    },
    include: { patient: true },
  });

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { userId: doctorUser.id },
  });
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { userId: patientUser.id },
  });

  const now = new Date();

  await prisma.appointment.upsert({
    where: { id: "seed-appointment-1" },
    update: {},
    create: {
      id: "seed-appointment-1",
      doctorId: doctor.id,
      patientId: patient.id,
      startAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      symptoms: "Chest pain and shortness of breath",
      status: "PENDING",
    },
  });

  await prisma.appointment.upsert({
    where: { id: "seed-appointment-2" },
    update: {},
    create: {
      id: "seed-appointment-2",
      doctorId: doctor.id,
      patientId: patient.id,
      startAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      symptoms: "Follow-up consultation",
      status: "APPROVED",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
