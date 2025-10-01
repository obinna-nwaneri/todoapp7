import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Role } from '../users/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  public async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = {
      sub: user.id,
      role: user.role,
      doctorId: user.doctor?.id,
      patientId: user.patient?.id,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      role: user.role,
      doctorId: user.doctor?.id,
      patientId: user.patient?.id,
    };
  }

  public buildRoleGuardPayload(token: {
    role: Role;
    doctorId?: number;
    patientId?: number;
  }) {
    return token;
  }
}
