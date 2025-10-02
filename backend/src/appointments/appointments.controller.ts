import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('admin/stats/counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCounts() {
    return this.appointmentsService.findAll({}).then((appointments) => ({
      totalAppointments: appointments.length,
      pending: appointments.filter((a) => a.status === 'PENDING').length,
      approved: appointments.filter((a) => a.status === 'APPROVED').length,
    }));
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('date') date?: string,
  ) {
    const filters: any = { status, doctorId, patientId, date };
    if (user.role === 'DOCTOR') {
      filters.doctorId = user.doctor?.id;
    }
    if (user.role === 'PATIENT') {
      filters.patientId = user.patient?.id;
    }
    return this.appointmentsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.appointmentsService.findOne(id, user);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: User) {
    if (user.role === 'PATIENT') {
      dto.patientId = user.patient?.id as string;
    }
    if (user.role === 'DOCTOR') {
      dto.doctorId = user.doctor?.id as string;
    }
    return this.appointmentsService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto, @CurrentUser() user: User) {
    return this.appointmentsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.appointmentsService.remove(id, user);
  }
}
