import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateDoctorDto) {
    let user = null;
    if (dto.userId) {
      user = await this.usersService.findOne(dto.userId);
      if (user.role !== 'DOCTOR') {
        throw new ForbiddenException('User is not a doctor');
      }
    }
    const doctor = this.doctorsRepository.create({
      user: user ?? undefined,
      name: dto.name,
      specialization: dto.specialization,
      yearsOfExperience: dto.yearsOfExperience,
      availabilitySchedule: dto.availabilitySchedule,
    });
    return this.doctorsRepository.save(doctor);
  }

  async findAll(q?: string) {
    if (q) {
      return this.doctorsRepository.find({
        where: [
          { name: ILike(`%${q}%`) },
          { specialization: ILike(`%${q}%`) },
        ],
      });
    }
    return this.doctorsRepository.find();
  }

  async findOne(id: string) {
    const doctor = await this.doctorsRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    return doctor;
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, dto);
    return this.doctorsRepository.save(doctor);
  }

  async remove(id: string) {
    await this.doctorsRepository.delete(id);
  }
}
