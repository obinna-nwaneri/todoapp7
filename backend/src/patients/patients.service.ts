import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
  ) {}

  findAll() {
    return this.patientsRepository.find();
  }

  async findOne(id: number) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  create(dto: CreatePatientDto) {
    const patient = this.patientsRepository.create(dto);
    return this.patientsRepository.save(patient);
  }

  async update(id: number, dto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: number) {
    const patient = await this.findOne(id);
    await this.patientsRepository.remove(patient);
    return { deleted: true };
  }
}
