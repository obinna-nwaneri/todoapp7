import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(@InjectRepository(Patient) private readonly patientsRepository: Repository<Patient>) {}

  create(dto: CreatePatientDto) {
    const patient = this.patientsRepository.create({
      ...dto,
      user: dto.userId ? ({ id: dto.userId } as any) : undefined
    });
    return this.patientsRepository.save(patient);
  }

  async createProfile(userId: string, dto: CreatePatientDto) {
    const { userId: _ignored, ...profile } = dto;
    const patient = this.patientsRepository.create({
      ...profile,
      user: { id: userId } as any
    });
    return this.patientsRepository.save(patient);
  }

  findAll() {
    return this.patientsRepository.find();
  }

  findById(id: string) {
    return this.patientsRepository.findOne({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.patientsRepository.findOne({ where: { user: { id: userId } } });
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.findById(id);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findById(id);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    await this.patientsRepository.remove(patient);
    return { deleted: true };
  }

  search(keyword: string) {
    const query = this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user');

    if (keyword) {
      query.andWhere(
        '(patient.name ILIKE :keyword OR patient.gender ILIKE :keyword OR user.email ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    return query.getMany();
  }
}
