import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment, AppointmentStatus } from '../appointments/appointment.entity';
import { UsersService } from '../users/users.service';
import { Role } from '../users/role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly usersService: UsersService,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    const doctorCount = await this.doctorRepository.count();
    if (doctorCount > 0) {
      return;
    }

    const adminPassword = await bcrypt.hash('admin123', 10);
    await this.usersService.createIfNotExists({
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.Admin,
    });

    const doctors = await this.doctorRepository.save([
      this.doctorRepository.create({
        name: 'Dr. John Smith',
        specialization: 'Cardiologist',
        email: 'john@example.com',
        phone: '555-0001',
      }),
      this.doctorRepository.create({
        name: 'Dr. Mary Jones',
        specialization: 'Dermatologist',
        email: 'mary@example.com',
        phone: '555-0002',
      }),
      this.doctorRepository.create({
        name: 'Dr. Alan White',
        specialization: 'Pediatrician',
        email: 'alan@example.com',
        phone: '555-0003',
      }),
    ]);

    await Promise.all(
      doctors.map((doctor) =>
        this.usersService.createIfNotExists({
          email: doctor.email,
          password: adminPassword,
          role: Role.Doctor,
          doctor,
        }),
      ),
    );

    const patients = await this.patientRepository.save([
      this.patientRepository.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-1001',
      }),
      this.patientRepository.create({
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '555-1002',
      }),
      this.patientRepository.create({
        name: 'Sarah Lee',
        email: 'sarah@example.com',
        phone: '555-1003',
      }),
    ]);

    await Promise.all(
      patients.map((patient) =>
        this.usersService.createIfNotExists({
          email: patient.email,
          password: adminPassword,
          role: Role.Patient,
          patient,
        }),
      ),
    );

    await this.appointmentRepository.save([
      this.appointmentRepository.create({
        doctor: doctors[0],
        patient: patients[0],
        date: '2025-10-02',
        time: '10:00',
        status: AppointmentStatus.Scheduled,
      }),
      this.appointmentRepository.create({
        doctor: doctors[1],
        patient: patients[1],
        date: '2025-10-03',
        time: '11:30',
        status: AppointmentStatus.Scheduled,
      }),
      this.appointmentRepository.create({
        doctor: doctors[2],
        patient: patients[2],
        date: '2025-10-04',
        time: '09:00',
        status: AppointmentStatus.Completed,
      }),
      this.appointmentRepository.create({
        doctor: doctors[0],
        patient: patients[1],
        date: '2025-10-05',
        time: '13:00',
        status: AppointmentStatus.Cancelled,
      }),
      this.appointmentRepository.create({
        doctor: doctors[1],
        patient: patients[2],
        date: '2025-10-06',
        time: '15:30',
        status: AppointmentStatus.Scheduled,
      }),
    ]);

    this.logger.log('Database seeded with initial data.');
  }
}
