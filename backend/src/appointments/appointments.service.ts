import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentStatus } from './appointment-status.enum';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService
  ) {}

  async create(dto: CreateAppointmentDto) {
    await this.ensureEntitiesExist(dto);
    await this.ensureNoCollision(dto.doctorId, dto.date, dto.time);

    const appointment = this.appointmentsRepository.create({
      date: dto.date,
      time: dto.time,
      symptoms: dto.symptoms,
      status: dto.status ?? AppointmentStatus.PENDING,
      doctor: { id: dto.doctorId } as any,
      patient: { id: dto.patientId } as any
    });
    return this.appointmentsRepository.save(appointment);
  }

  findAll() {
    return this.appointmentsRepository.find();
  }

  findById(id: string) {
    return this.appointmentsRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findById(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (dto.doctorId || dto.patientId) {
      await this.ensureEntitiesExist({
        doctorId: dto.doctorId ?? appointment.doctor.id,
        patientId: dto.patientId ?? appointment.patient.id
      });
    }

    if (dto.doctorId || dto.date || dto.time) {
      await this.ensureNoCollision(
        dto.doctorId ?? appointment.doctor.id,
        dto.date ?? appointment.date,
        dto.time ?? appointment.time,
        appointment.id
      );
    }

    Object.assign(appointment, {
      ...dto,
      doctor: dto.doctorId ? ({ id: dto.doctorId } as any) : appointment.doctor,
      patient: dto.patientId ? ({ id: dto.patientId } as any) : appointment.patient
    });
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string) {
    const appointment = await this.findById(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    await this.appointmentsRepository.remove(appointment);
    return { deleted: true };
  }

  async removeForPatient(id: string, patientId: string) {
    const appointment = await this.findById(id);
    if (!appointment || appointment.patient.id !== patientId) {
      throw new NotFoundException('Appointment not found');
    }
    await this.appointmentsRepository.remove(appointment);
    return { deleted: true };
  }

  forDoctor(doctorId: string) {
    return this.appointmentsRepository.find({
      where: { doctor: { id: doctorId } },
      order: { date: 'ASC', time: 'ASC' }
    });
  }

  forPatient(patientId: string) {
    return this.appointmentsRepository.find({
      where: { patient: { id: patientId } },
      order: { date: 'ASC', time: 'ASC' }
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.findById(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    appointment.status = status;
    return this.appointmentsRepository.save(appointment);
  }

  search({
    q,
    status,
    date,
    doctorId,
    patientId
  }: {
    q?: string;
    status?: AppointmentStatus;
    date?: string;
    doctorId?: string;
    patientId?: string;
  }) {
    const query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor');

    if (q) {
      query.andWhere(
        '(patient.name ILIKE :q OR doctor.name ILIKE :q OR appointment.symptoms ILIKE :q)',
        { q: `%${q}%` }
      );
    }
    if (status) {
      query.andWhere('appointment.status = :status', { status });
    }
    if (date) {
      query.andWhere('appointment.date = :date', { date });
    }
    if (doctorId) {
      query.andWhere('doctor.id = :doctorId', { doctorId });
    }
    if (patientId) {
      query.andWhere('patient.id = :patientId', { patientId });
    }

    return query.getMany();
  }

  private async ensureEntitiesExist({
    doctorId,
    patientId
  }: {
    doctorId: string;
    patientId: string;
  }) {
    const [doctor, patient] = await Promise.all([
      this.doctorsService.findById(doctorId),
      this.patientsService.findById(patientId)
    ]);
    if (!doctor || !patient) {
      throw new BadRequestException('Invalid doctor or patient reference');
    }
  }

  private async ensureNoCollision(doctorId: string, date: string, time: string, ignoreId?: string) {
    const existing = await this.appointmentsRepository.findOne({
      where: {
        doctor: { id: doctorId },
        date,
        time
      },
      relations: ['doctor']
    });
    if (existing && existing.id !== ignoreId) {
      throw new BadRequestException('Time slot already booked for this doctor');
    }
  }
}
