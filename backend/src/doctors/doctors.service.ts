import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  public findAll(): Promise<Doctor[]> {
    return this.doctorRepository.find();
  }

  public async create(data: Partial<Doctor>): Promise<Doctor> {
    const doctor = this.doctorRepository.create(data);
    return this.doctorRepository.save(doctor);
  }

  public findOne(id: number): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { id } });
  }
}
