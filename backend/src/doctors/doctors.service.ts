import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(@InjectRepository(Doctor) private readonly doctorsRepository: Repository<Doctor>) {}

  create(dto: CreateDoctorDto) {
    const doctor = this.doctorsRepository.create({
      ...dto,
      user: dto.userId ? ({ id: dto.userId } as any) : undefined
    });
    return this.doctorsRepository.save(doctor);
  }

  async createProfile(userId: string, dto: CreateDoctorDto) {
    const { userId: _ignored, ...profile } = dto;
    const doctor = this.doctorsRepository.create({
      ...profile,
      user: { id: userId } as any
    });
    return this.doctorsRepository.save(doctor);
  }

  findAll() {
    return this.doctorsRepository.find();
  }

  findById(id: string) {
    return this.doctorsRepository.findOne({ where: { id } });
  }

  findByUserId(userId: string) {
    return this.doctorsRepository.findOne({ where: { user: { id: userId } } });
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    Object.assign(doctor, dto);
    return this.doctorsRepository.save(doctor);
  }

  async remove(id: string) {
    const doctor = await this.findById(id);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    await this.doctorsRepository.remove(doctor);
    return { deleted: true };
  }

  search(keyword: string) {
    const query = this.doctorsRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user');

    if (keyword) {
      query.andWhere(
        '(doctor.name ILIKE :keyword OR doctor.specialization ILIKE :keyword OR user.email ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    return query.getMany();
  }
}
