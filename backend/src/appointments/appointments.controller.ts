import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './appointment.entity';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(Role.Admin, Role.Doctor, Role.Patient)
  public findAll(@Request() req: any) {
    return this.appointmentsService.findAllForUser(req.user);
  }

  @Post()
  @Roles(Role.Admin, Role.Patient)
  public async create(@Body() dto: CreateAppointmentDto, @Request() req: any) {
    if (req.user.role === Role.Patient && req.user.patientId !== dto.patientId) {
      throw new BadRequestException('Patients can only book appointments for themselves');
    }
    return this.appointmentsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.Doctor, Role.Patient)
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
    @Request() req: any,
  ) {
    const appointment = await this.ensureOwnership(id, req.user);
    if (req.user.role === Role.Patient || req.user.role === Role.Doctor) {
      return this.appointmentsService.update(id, {
        status: dto.status ?? appointment.status,
      });
    }
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Patient)
  public async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.ensureOwnership(id, req.user, { allowDoctor: false });
    return this.appointmentsService.remove(id);
  }

  private async ensureOwnership(
    id: number,
    user: { role: Role; doctorId?: number; patientId?: number },
    options: { allowDoctor?: boolean } = { allowDoctor: true },
  ): Promise<Appointment> {
    const appointment = await this.appointmentsService.findOne(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (user.role === Role.Doctor && options.allowDoctor !== false) {
      if (appointment.doctor.id !== user.doctorId) {
        throw new ForbiddenException('Cannot access appointments for other doctors');
      }
    }
    if (user.role === Role.Patient) {
      if (appointment.patient.id !== user.patientId) {
        throw new ForbiddenException('Cannot access other patients\' appointments');
      }
    }
    return appointment;
  }
}
