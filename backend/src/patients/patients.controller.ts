import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  getAll(@Query('q') q?: string) {
    if (q) {
      return this.patientsService.search(q);
    }
    return this.patientsService.findAll();
  }

  @Get('me')
  @Roles(UserRole.PATIENT)
  getMe(@CurrentUser() user: User) {
    return this.patientsService.findByUserId(user.id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto, @CurrentUser() user: User) {
    if (user.role === UserRole.PATIENT) {
      return this.patientsService.update(user.patientProfile?.id ?? id, dto);
    }
    return this.patientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
