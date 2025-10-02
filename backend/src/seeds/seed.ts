import 'reflect-metadata';

import * as bcrypt from 'bcrypt';

import dataSource from '../typeorm.config';
import { AppointmentStatus } from '../appointments/appointment-status.enum';
import { Appointment } from '../appointments/appointment.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';

async function seed() {
  const ds = await dataSource.initialize();
  const userRepo = ds.getRepository(User);
  const doctorRepo = ds.getRepository(Doctor);
  const patientRepo = ds.getRepository(Patient);
  const appointmentRepo = ds.getRepository(Appointment);

  await appointmentRepo.delete({});
  await doctorRepo.delete({});
  await patientRepo.delete({});
  await userRepo.delete({});

  const admin = userRepo.create({
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    role: UserRole.ADMIN
  });
  await userRepo.save(admin);

  const doctorUser = userRepo.create({
    email: 'doctor1@example.com',
    password: await bcrypt.hash('doctor123', 10),
    role: UserRole.DOCTOR
  });
  await userRepo.save(doctorUser);

  const doctorProfile = doctorRepo.create({
    name: 'Dr. Meredith Grey',
    specialization: 'Cardiology',
    yearsOfExperience: 10,
    availabilitySchedule: {
      monday: ['09:00', '11:00'],
      wednesday: ['13:00', '15:00']
    },
    user: doctorUser
  });
  await doctorRepo.save(doctorProfile);

  const patientUser = userRepo.create({
    email: 'patient1@example.com',
    password: await bcrypt.hash('patient123', 10),
    role: UserRole.PATIENT
  });
  await userRepo.save(patientUser);

  const patientProfile = patientRepo.create({
    name: 'John Doe',
    age: 34,
    gender: 'Male',
    contactInfo: '555-0101',
    user: patientUser
  });
  await patientRepo.save(patientProfile);

  const appointment1 = appointmentRepo.create({
    doctor: doctorProfile,
    patient: patientProfile,
    date: '2024-04-20',
    time: '09:00',
    symptoms: 'Chest pain and shortness of breath',
    status: AppointmentStatus.APPROVED
  });
  const appointment2 = appointmentRepo.create({
    doctor: doctorProfile,
    patient: patientProfile,
    date: '2024-04-25',
    time: '11:30',
    symptoms: 'Follow-up consultation',
    status: AppointmentStatus.PENDING
  });
  await appointmentRepo.save([appointment1, appointment2]);

  console.log('Seed data successfully inserted');
  await ds.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed', error);
  process.exit(1);
});
