import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Controller('doctors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Roles(Role.Admin, Role.Doctor, Role.Patient)
  public findAll() {
    return this.doctorsService.findAll();
  }

  @Post()
  @Roles(Role.Admin)
  public async create(@Body() createDoctorDto: CreateDoctorDto) {
    const doctor = await this.doctorsService.create(createDoctorDto);
    await this.usersService.ensureUser({
      email: doctor.email,
      password: await bcrypt.hash('password123', 10),
      role: Role.Doctor,
      doctor,
    });
    return doctor;
  }
}
