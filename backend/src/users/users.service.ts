import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>) {
    const entity = this.usersRepository.create(user);
    return this.usersRepository.save(entity);
  }

  countByRole(role?: UserRole) {
    if (role) {
      return this.usersRepository.count({ where: { role } });
    }
    return this.usersRepository.count();
  }
}
