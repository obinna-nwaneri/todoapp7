import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  create(data: Partial<User>) {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['doctorProfile', 'patientProfile']
    });
  }

  findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['doctorProfile', 'patientProfile']
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  countByRole(role: UserRole) {
    return this.usersRepository.count({ where: { role } });
  }
}
