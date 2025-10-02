import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreatePatientDto) {
    let user = null;
    if (dto.userId) {
      user = await this.usersService.findOne(dto.userId);
      if (user.role !== 'PATIENT') {
        throw new ForbiddenException('User is not a patient');
      }
    }
    const patient = this.patientsRepository.create({
      user: user ?? undefined,
      name: dto.name,
      age: dto.age,
      gender: dto.gender,
      contactInfo: dto.contactInfo,
    });
    return this.patientsRepository.save(patient);
  }

  async findAll(q?: string) {
    if (q) {
      return this.patientsRepository.find({
        where: [
          { name: ILike(`%${q}%`) },
          { contactInfo: ILike(`%${q}%`) },
        ],
      });
    }
    return this.patientsRepository.find();
  }

  async findOne(id: string) {
    const patient = await this.patientsRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string) {
    await this.patientsRepository.delete(id);
  }
}
