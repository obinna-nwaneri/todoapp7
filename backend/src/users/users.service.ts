import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from '../activity/activity.service.js';
import { ActivityAction } from '../activity/activity-log.entity.js';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto.js';
import { User, UserRole } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
  ) {}

  async paginate(query: PaginationQueryDto & {
    q?: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, q, role } = query;
    let { isActive } = query;
    if (typeof isActive === 'string') {
      isActive = isActive === 'true';
    }
    const qb = this.usersRepository.createQueryBuilder('user');
    if (q) {
      qb.andWhere(
        '(user.email ILIKE :q OR user.firstName ILIKE :q OR user.lastName ILIKE :q)',
        { q: `%${q}%` },
      );
    }
    if (role) {
      qb.andWhere('user.role = :role', { role });
    }
    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.orderBy('user.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }
    return user;
  }

  async create(dto: CreateUserDto, actorId?: string): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
    }
    const passwordHash = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('bcrypt.saltRounds', 10),
    );
    const user = this.usersRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      isActive: dto.isActive,
      passwordHash,
    });
    const saved = await this.usersRepository.save(user);
    await this.activityService.log({
      actorId: actorId ?? null,
      entity: 'User',
      entityId: saved.id,
      action: ActivityAction.CREATE,
      meta: { email: saved.email, role: saved.role },
    });
    return saved;
  }

  async update(id: string, dto: UpdateUserDto, actor: User): Promise<User> {
    const user = await this.findById(id);
    if (actor.role !== UserRole.ADMIN && actor.id !== user.id) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new BadRequestException({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
      }
      user.email = dto.email;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(
        dto.password,
        this.configService.get<number>('bcrypt.saltRounds', 10),
      );
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.role && actor.role === UserRole.ADMIN) user.role = dto.role;
    if (dto.isActive !== undefined && actor.role === UserRole.ADMIN) user.isActive = dto.isActive;

    const saved = await this.usersRepository.save(user);
    const { password, ...rest } = dto;
    await this.activityService.log({
      actorId: actor.id,
      entity: 'User',
      entityId: saved.id,
      action: ActivityAction.UPDATE,
      meta: rest,
    });
    return saved;
  }

  async delete(id: string, actor: User): Promise<void> {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
    await this.activityService.log({
      actorId: actor.id,
      entity: 'User',
      entityId: id,
      action: ActivityAction.DELETE,
      meta: { email: user.email },
    });
  }
}
