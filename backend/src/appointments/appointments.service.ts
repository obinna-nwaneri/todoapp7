import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly patientsService: PatientsService,
  ) {}

  findAll() {
    return this.appointmentsRepository.find({
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findOne(id: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async create(dto: CreateAppointmentDto) {
    const doctor = await this.doctorsService.findOne(dto.doctorId);
    const patient = await this.patientsService.findOne(dto.patientId);

    const appointment = this.appointmentsRepository.create({
      doctor,
      patient,
      date: dto.date,
      time: dto.time,
      status: dto.status ?? AppointmentStatus.Scheduled,
    });
    return this.appointmentsRepository.save(appointment);
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);
    if (dto.doctorId) {
      appointment.doctor = await this.doctorsService.findOne(dto.doctorId);
    }
    if (dto.patientId) {
      appointment.patient = await this.patientsService.findOne(dto.patientId);
    }
    if (dto.date) {
      appointment.date = dto.date;
    }
    if (dto.time) {
      appointment.time = dto.time;
    }
    if (dto.status) {
      appointment.status = dto.status;
    }
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: number) {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
    return { deleted: true };
  }
}
