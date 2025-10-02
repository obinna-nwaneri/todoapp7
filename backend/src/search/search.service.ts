import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async search(params: {
    entity: string;
    q?: string;
    status?: string;
    date?: string;
    doctorId?: string;
    patientId?: string;
  }) {
    switch (params.entity) {
      case 'doctors':
        return this.doctorsRepository.find({
          where: params.q
            ? [
                { name: ILike(`%${params.q}%`) },
                { specialization: ILike(`%${params.q}%`) },
              ]
            : undefined,
        });
      case 'patients':
        return this.patientsRepository.find({
          where: params.q
            ? [
                { name: ILike(`%${params.q}%`) },
                { contactInfo: ILike(`%${params.q}%`) },
              ]
            : undefined,
        });
      case 'appointments':
        const qb = this.appointmentsRepository.createQueryBuilder('appointment')
          .leftJoinAndSelect('appointment.patient', 'patient')
          .leftJoinAndSelect('appointment.doctor', 'doctor');
        if (params.q) {
          qb.andWhere('(patient.name ILIKE :q OR doctor.name ILIKE :q OR appointment.symptoms ILIKE :q)', {
            q: `%${params.q}%`,
          });
        }
        if (params.status) {
          qb.andWhere('appointment.status = :status', { status: params.status });
        }
        if (params.date) {
          qb.andWhere('appointment.date = :date', { date: params.date });
        }
        if (params.doctorId) {
          qb.andWhere('doctor.id = :doctorId', { doctorId: params.doctorId });
        }
        if (params.patientId) {
          qb.andWhere('patient.id = :patientId', { patientId: params.patientId });
        }
        return qb.getMany();
      default:
        return [];
    }
  }
}
