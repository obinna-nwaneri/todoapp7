import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.enum';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';

interface CreateUserOptions {
  email: string;
  password: string;
  role: Role;
  doctor?: Doctor;
  patient?: Patient;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  public async createIfNotExists(options: CreateUserOptions): Promise<User> {
    const existing = await this.findByEmail(options.email);
    if (existing) {
      return existing;
    }
    const user = this.usersRepository.create(options);
    return this.usersRepository.save(user);
  }

  public async ensureUser(options: CreateUserOptions): Promise<User> {
    const user = this.usersRepository.create(options);
    return this.usersRepository.save(user);
  }
}
