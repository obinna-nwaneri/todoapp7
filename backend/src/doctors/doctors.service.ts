import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}

  findAll() {
    return this.doctorsRepository.find();
  }

  async findOne(id: number) {
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async create(dto: CreateDoctorDto) {
    const doctor = this.doctorsRepository.create(dto);
    return this.doctorsRepository.save(doctor);
  }

  async update(id: number, dto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, dto);
    return this.doctorsRepository.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);
    await this.doctorsRepository.remove(doctor);
    return { deleted: true };
  }
}
