import { PrismaClient, Role, AppointmentStatus } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hash("admin123", 10);
  const doctorPassword = await hash("doctor123", 10);
  const patientPassword = await hash("patient123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN
    }
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: "doctor1@example.com",
      password: doctorPassword,
      role: Role.DOCTOR,
      doctor: {
        create: {
          name: "Dr. John Doe",
          specialization: "Cardiology",
          yearsOfExperience: 10,
          availabilitySchedule: { monday: "09:00-17:00", wednesday: "09:00-17:00" }
        }
      }
    },
    include: { doctor: true }
  });

  const patientUser = await prisma.user.create({
    data: {
      email: "patient1@example.com",
      password: patientPassword,
      role: Role.PATIENT,
      patient: {
        create: {
          name: "Jane Patient",
          age: 32,
          gender: "Female",
          contactInfo: { phone: "555-0100", email: "patient1@example.com" }
        }
      }
    },
    include: { patient: true }
  });

  const doctor = doctorUser.doctor!;
  const patient = patientUser.patient!;

  await prisma.appointment.createMany({
    data: [
      {
        doctorId: doctor.id,
        patientId: patient.id,
        date: new Date(),
        time: "10:00",
        symptoms: "Chest pain and shortness of breath",
        status: AppointmentStatus.PENDING
      },
      {
        doctorId: doctor.id,
        patientId: patient.id,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        time: "14:00",
        symptoms: "Follow-up consultation",
        status: AppointmentStatus.APPROVED
      }
    ]
  });

  console.log({ admin: admin.email, doctor: doctorUser.email, patient: patientUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
