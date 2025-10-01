import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  public findAll(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  public async create(data: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(data);
    return this.patientRepository.save(patient);
  }

  public findOne(id: number): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { id } });
  }
}
