import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from '../activity/activity.service.js';
import { ActivityAction } from '../activity/activity-log.entity.js';
import { User, UserRole } from '../users/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    const existing = await this.usersRepository.findOne({ where: { email: registerDto.email } });
    if (existing) {
      throw new UnauthorizedException({ message: 'Email already registered', code: 'EMAIL_TAKEN' });
    }
    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.configService.get<number>('bcrypt.saltRounds', 10),
    );
    const user = this.usersRepository.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: UserRole.USER,
    });
    const savedUser = await this.usersRepository.save(user);
    const accessToken = await this.generateToken(savedUser);
    await this.activityService.log({
      action: ActivityAction.CREATE,
      entity: 'User',
      entityId: savedUser.id,
      actorId: savedUser.id,
      meta: { email: savedUser.email },
    });
    return { user: savedUser, accessToken };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email, isActive: true } });
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid credentials', code: 'INVALID_LOGIN' });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException({ message: 'Invalid credentials', code: 'INVALID_LOGIN' });
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const accessToken = await this.generateToken(user);
    await this.activityService.log({
      action: ActivityAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      actorId: user.id,
      meta: { email: user.email },
    });
    return { user, accessToken };
  }

  async generateToken(user: User) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
