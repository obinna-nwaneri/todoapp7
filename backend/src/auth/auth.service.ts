import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.enum';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
    private readonly jwtService: JwtService
  ) {}

  async registerDoctor(dto: RegisterDoctorDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashed,
      role: UserRole.DOCTOR
    });
    await this.doctorsService.createProfile(user.id, dto);

    return this.generateTokens(user.id, user.email, user.role);
  }

  async registerPatient(dto: RegisterPatientDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashed,
      role: UserRole.PATIENT
    });
    await this.patientsService.createProfile(user.id, dto);

    return this.generateTokens(user.id, user.email, user.role);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.REFRESH_SECRET
      });
      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(sub: string, email: string, role: UserRole) {
    const payload: JwtPayload = { sub, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m'
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d'
    });

    return {
      accessToken,
      refreshToken,
      role
    };
  }
}
