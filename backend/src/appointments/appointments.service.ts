import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
import { Role } from '../users/role.enum';

interface UserContext {
  role: Role;
  doctorId?: number;
  patientId?: number;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
  ) {}

  public async findAllForUser(user: UserContext) {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient');

    if (user.role === Role.Doctor) {
      query.where('doctor.id = :doctorId', { doctorId: user.doctorId });
    } else if (user.role === Role.Patient) {
      query.where('patient.id = :patientId', { patientId: user.patientId });
    }

    return query
      .orderBy('appointment.date', 'ASC')
      .addOrderBy('appointment.time', 'ASC')
      .getMany();
  }

  public findOne(id: number) {
    return this.appointmentRepository.findOne({ where: { id } });
  }

  public async create(data: {
    doctorId: number;
    patientId: number;
    date: string;
    time: string;
    status?: AppointmentStatus;
  }) {
    const doctor = await this.doctorsService.findOne(data.doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    const patient = await this.patientsService.findOne(data.patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    const appointment = this.appointmentRepository.create({
      doctor,
      patient,
      date: data.date,
      time: data.time,
      status: data.status ?? AppointmentStatus.Scheduled,
    });
    return this.appointmentRepository.save(appointment);
  }

  public async update(
    id: number,
    data: Partial<{
      doctorId: number;
      patientId: number;
      date: string;
      time: string;
      status: AppointmentStatus;
    }>,
  ) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (data.doctorId) {
      const doctor = await this.doctorsService.findOne(data.doctorId);
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      appointment.doctor = doctor;
    }

    if (data.patientId) {
      const patient = await this.patientsService.findOne(data.patientId);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      appointment.patient = patient;
    }

    if (data.date) {
      appointment.date = data.date;
    }

    if (data.time) {
      appointment.time = data.time;
    }

    if (data.status) {
      appointment.status = data.status;
    }

    return this.appointmentRepository.save(appointment);
  }

  public async remove(id: number) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    await this.appointmentRepository.remove(appointment);
    return { deleted: true };
  }
}
