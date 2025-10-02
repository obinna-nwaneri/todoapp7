import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AppointmentStatus } from '../appointments/appointment-status.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('entity') entity?: string,
    @Query('q') q?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string
  ) {
    return this.searchService.search({ entity, q, status, date, doctorId, patientId });
  }
}
