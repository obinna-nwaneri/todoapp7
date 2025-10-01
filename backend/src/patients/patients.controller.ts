import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Roles(Role.Admin)
  public findAll() {
    return this.patientsService.findAll();
  }

  @Post()
  @Roles(Role.Admin)
  public async create(@Body() createPatientDto: CreatePatientDto) {
    const patient = await this.patientsService.create(createPatientDto);
    await this.usersService.ensureUser({
      email: patient.email,
      password: await bcrypt.hash('password123', 10),
      role: Role.Patient,
      patient,
    });
    return patient;
  }
}
