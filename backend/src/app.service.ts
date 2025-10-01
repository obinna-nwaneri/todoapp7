import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointments/appointment.entity';
import { Doctor } from './doctors/doctor.entity';
import { Patient } from './patients/patient.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async getStats() {
    const [doctors, patients, appointments] = await Promise.all([
      this.doctorsRepository.count(),
      this.patientsRepository.count(),
      this.appointmentsRepository.count(),
    ]);

    const appointmentsPerDoctor = await this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoin('appointment.doctor', 'doctor')
      .select('doctor.name', 'doctor')
      .addSelect('COUNT(appointment.id)', 'total')
      .groupBy('doctor.name')
      .getRawMany();

    const upcomingAppointments = await this.appointmentsRepository.find({
      order: { date: 'ASC', time: 'ASC' },
      take: 5,
    });

    return {
      totals: {
        doctors,
        patients,
        appointments,
      },
      appointmentsPerDoctor,
      upcomingAppointments,
    };
  }
}
