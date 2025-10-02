import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { AppointmentStatus } from './appointment-status.enum';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string
  ) {
    return this.appointmentsService.search({ q, status, date, doctorId, patientId });
  }

  @Get('doctor')
  @Roles(UserRole.DOCTOR)
  forDoctor(@CurrentUser() user: User) {
    if (!user.doctorProfile?.id) {
      throw new UnauthorizedException('Doctor profile not found');
    }
    return this.appointmentsService.forDoctor(user.doctorProfile.id);
  }

  @Get('patient')
  @Roles(UserRole.PATIENT)
  forPatient(@CurrentUser() user: User) {
    if (!user.patientProfile?.id) {
      throw new UnauthorizedException('Patient profile not found');
    }
    return this.appointmentsService.forPatient(user.patientProfile.id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Post('book')
  @Roles(UserRole.PATIENT)
  book(@Body() dto: BookAppointmentDto, @CurrentUser() user: User) {
    if (!user.patientProfile?.id) {
      throw new UnauthorizedException('Patient profile not found');
    }
    return this.appointmentsService.create({
      ...dto,
      patientId: user.patientProfile.id
    } as CreateAppointmentDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Put(':id/patient')
  @Roles(UserRole.PATIENT)
  async updateForPatient(@Param('id') id: string, @Body() dto: UpdateAppointmentDto, @CurrentUser() user: User) {
    if (!user.patientProfile?.id) {
      throw new UnauthorizedException('Patient profile not found');
    }
    const appointment = await this.appointmentsService.findById(id);
    if (!appointment || appointment.patient.id !== user.patientProfile.id) {
      throw new ForbiddenException('You can only modify your own appointments');
    }
    const { status, doctorId: _ignoredDoctor, patientId: _ignoredPatient, ...rest } = dto;
    return this.appointmentsService.update(id, {
      ...rest,
      patientId: user.patientProfile.id
    });
  }

  @Put(':id/status')
  @Roles(UserRole.DOCTOR)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: User) {
    if (!user.doctorProfile?.id) {
      throw new UnauthorizedException('Doctor profile not found');
    }
    const appointment = await this.appointmentsService.findById(id);
    if (!appointment || appointment.doctor.id !== user.doctorProfile.id) {
      throw new ForbiddenException('You can only update your own appointments');
    }
    return this.appointmentsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Delete(':id/patient')
  @Roles(UserRole.PATIENT)
  removeForPatient(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.patientProfile?.id) {
      throw new UnauthorizedException('Patient profile not found');
    }
    return this.appointmentsService.removeForPatient(id, user.patientProfile.id);
  }
}
