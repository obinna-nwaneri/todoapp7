import * as bcrypt from 'bcrypt';
import { Appointment } from './appointments/appointment.entity';
import { AppointmentStatus } from './appointments/appointment-status.enum';
import { AppDataSource } from './data-source';
import { Doctor } from './doctors/doctor.entity';
import { Patient } from './patients/patient.entity';
import { User } from './users/user.entity';
import { UserRole } from './users/user-role.enum';

async function seed() {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true);

  const doctorRepository = AppDataSource.getRepository(Doctor);
  const patientRepository = AppDataSource.getRepository(Patient);
  const appointmentRepository = AppDataSource.getRepository(Appointment);
  const userRepository = AppDataSource.getRepository(User);

  const password = await bcrypt.hash('password123', 10);

  const doctors = await doctorRepository.save([
    doctorRepository.create({
      name: 'Dr. John Smith',
      specialization: 'Cardiologist',
      email: 'john@example.com',
      phone: '0801111111',
    }),
    doctorRepository.create({
      name: 'Dr. Mary Jones',
      specialization: 'Dermatologist',
      email: 'mary@example.com',
      phone: '0802222222',
    }),
    doctorRepository.create({
      name: 'Dr. Alan White',
      specialization: 'Pediatrician',
      email: 'alan@example.com',
      phone: '0803333333',
    }),
  ]);

  const patients = await patientRepository.save([
    patientRepository.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0804444444',
    }),
    patientRepository.create({
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '0805555555',
    }),
    patientRepository.create({
      name: 'Sarah Lee',
      email: 'sarah@example.com',
      phone: '0806666666',
    }),
  ]);

  await userRepository.save([
    userRepository.create({
      email: 'admin@example.com',
      password,
      role: UserRole.Admin,
    }),
    ...doctors.map((doctor) =>
      userRepository.create({
        email: doctor.email,
        password,
        role: UserRole.Doctor,
      }),
    ),
    ...patients.map((patient) =>
      userRepository.create({
        email: patient.email,
        password,
        role: UserRole.Patient,
      }),
    ),
  ]);

  await appointmentRepository.save([
    appointmentRepository.create({
      doctor: doctors[0],
      patient: patients[0],
      date: '2025-10-02',
      time: '10:00',
      status: AppointmentStatus.Scheduled,
    }),
    appointmentRepository.create({
      doctor: doctors[1],
      patient: patients[1],
      date: '2025-10-03',
      time: '11:30',
      status: AppointmentStatus.Scheduled,
    }),
    appointmentRepository.create({
      doctor: doctors[2],
      patient: patients[2],
      date: '2025-10-04',
      time: '09:00',
      status: AppointmentStatus.Completed,
    }),
    appointmentRepository.create({
      doctor: doctors[1],
      patient: patients[0],
      date: '2025-10-05',
      time: '15:00',
      status: AppointmentStatus.Cancelled,
    }),
    appointmentRepository.create({
      doctor: doctors[2],
      patient: patients[1],
      date: '2025-10-06',
      time: '12:00',
      status: AppointmentStatus.Scheduled,
    }),
  ]);

  await AppDataSource.destroy();
  console.log('Database seeded successfully');
}

seed().catch((error) => {
  console.error('Seeding error:', error);
  process.exit(1);
});
