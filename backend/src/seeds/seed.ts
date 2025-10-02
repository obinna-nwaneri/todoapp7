import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from '../typeorm.config';
import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../appointments/appointment.entity';
import * as bcrypt from 'bcrypt';

async function runSeed() {
  config();
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const doctorRepo = AppDataSource.getRepository(Doctor);
  const patientRepo = AppDataSource.getRepository(Patient);
  const appointmentRepo = AppDataSource.getRepository(Appointment);

  await appointmentRepo.delete({});
  await doctorRepo.delete({});
  await patientRepo.delete({});
  await userRepo.delete({});

  const admin = userRepo.create({
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'ADMIN',
  });
  await userRepo.save(admin);

  const doctorUser = userRepo.create({
    email: 'doctor1@example.com',
    password: await bcrypt.hash('doctor123', 10),
    role: 'DOCTOR',
  });
  await userRepo.save(doctorUser);

  const doctor = doctorRepo.create({
    user: doctorUser,
    name: 'Dr. Meredith Grey',
    specialization: 'Cardiology',
    yearsOfExperience: 8,
    availabilitySchedule: {
      monday: ['09:00', '11:00'],
      wednesday: ['13:00', '15:00'],
    },
  });
  await doctorRepo.save(doctor);

  const patientUser = userRepo.create({
    email: 'patient1@example.com',
    password: await bcrypt.hash('patient123', 10),
    role: 'PATIENT',
  });
  await userRepo.save(patientUser);

  const patient = patientRepo.create({
    user: patientUser,
    name: 'Alex Johnson',
    age: 32,
    gender: 'Male',
    contactInfo: 'alex.johnson@example.com',
  });
  await patientRepo.save(patient);

  const appointment1 = appointmentRepo.create({
    doctor,
    patient,
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    symptoms: 'Headache and dizziness',
    status: 'PENDING',
  });
  await appointmentRepo.save(appointment1);

  const appointment2 = appointmentRepo.create({
    doctor,
    patient,
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '14:00',
    symptoms: 'Follow-up checkup',
    status: 'APPROVED',
  });
  await appointmentRepo.save(appointment2);

  await AppDataSource.destroy();
  console.log('Seed completed');
}

runSeed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
