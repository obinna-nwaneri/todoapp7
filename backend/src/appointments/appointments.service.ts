import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { User } from '../users/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  async create(dto: CreateAppointmentDto, requester: User) {
    if (requester.role === 'PATIENT' && requester.patient?.id !== dto.patientId) {
      throw new ForbiddenException('Cannot create appointment for another patient');
    }
    if (requester.role === 'DOCTOR' && requester.doctor?.id !== dto.doctorId) {
      throw new ForbiddenException('Cannot create appointment for another doctor');
    }
    const patient = await this.patientsService.findOne(dto.patientId);
    const doctor = await this.doctorsService.findOne(dto.doctorId);

    await this.ensureAvailability(doctor.id, dto.date, dto.time, dto.patientId);

    const appointment = this.appointmentsRepository.create({
      patient,
      doctor,
      date: dto.date,
      time: dto.time,
      symptoms: dto.symptoms,
      status: dto.status ?? 'PENDING',
    });
    return this.appointmentsRepository.save(appointment);
  }

  async findAll(filters: {
    status?: string;
    doctorId?: string;
    patientId?: string;
    date?: string;
  }) {
    const qb = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor');

    if (filters.status) {
      qb.andWhere('appointment.status = :status', { status: filters.status });
    }
    if (filters.doctorId) {
      qb.andWhere('doctor.id = :doctorId', { doctorId: filters.doctorId });
    }
    if (filters.patientId) {
      qb.andWhere('patient.id = :patientId', { patientId: filters.patientId });
    }
    if (filters.date) {
      qb.andWhere('appointment.date = :date', { date: filters.date });
    }

    return qb.orderBy('appointment.date', 'ASC').addOrderBy('appointment.time', 'ASC').getMany();
  }

  async findOne(id: string, requester: User) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    this.assertOwnership(appointment, requester);
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto, requester: User) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    this.assertOwnership(appointment, requester);
    if (dto.doctorId && dto.doctorId !== appointment.doctor.id) {
      appointment.doctor = await this.doctorsService.findOne(dto.doctorId);
    }
    if (dto.patientId && dto.patientId !== appointment.patient.id) {
      appointment.patient = await this.patientsService.findOne(dto.patientId);
    }
    if ((dto.date && dto.date !== appointment.date) || (dto.time && dto.time !== appointment.time)) {
      await this.ensureAvailability(
        dto.doctorId ?? appointment.doctor.id,
        dto.date ?? appointment.date,
        dto.time ?? appointment.time,
        dto.patientId ?? appointment.patient.id,
        id,
      );
    }
    Object.assign(appointment, {
      date: dto.date ?? appointment.date,
      time: dto.time ?? appointment.time,
      symptoms: dto.symptoms ?? appointment.symptoms,
      status: dto.status ?? appointment.status,
    });
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string, requester: User) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    this.assertOwnership(appointment, requester);
    await this.appointmentsRepository.delete(id);
    return { deleted: true };
  }

  private assertOwnership(appointment: Appointment, requester: User) {
    if (requester.role === 'ADMIN') {
      return true;
    }
    if (requester.role === 'DOCTOR' && appointment.doctor.id === requester.doctor?.id) {
      return true;
    }
    if (requester.role === 'PATIENT' && appointment.patient.id === requester.patient?.id) {
      return true;
    }
    throw new ForbiddenException('Not authorized');
  }

  private async ensureAvailability(
    doctorId: string,
    date: string,
    time: string,
    patientId: string,
    excludeId?: string,
  ) {
    const conflict = await this.appointmentsRepository.findOne({
      where: {
        doctor: { id: doctorId } as any,
        date,
        time,
      },
      relations: ['doctor'],
    });
    if (conflict && conflict.id !== excludeId) {
      throw new BadRequestException('Time slot not available');
    }
    const patientConflict = await this.appointmentsRepository.findOne({
      where: {
        patient: { id: patientId } as any,
        date,
        time,
      },
      relations: ['patient'],
    });
    if (patientConflict && patientConflict.id !== excludeId) {
      throw new BadRequestException('Patient already has an appointment at this time');
    }
  }
}
