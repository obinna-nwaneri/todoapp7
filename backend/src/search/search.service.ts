import { Injectable, BadRequestException } from '@nestjs/common';

import { AppointmentsService } from '../appointments/appointments.service';
import { AppointmentStatus } from '../appointments/appointment-status.enum';
import { DoctorsService } from '../doctors/doctors.service';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
    private readonly appointmentsService: AppointmentsService
  ) {}

  async search(params: {
    entity?: string;
    q?: string;
    status?: AppointmentStatus;
    date?: string;
    doctorId?: string;
    patientId?: string;
  }) {
    switch (params.entity) {
      case 'doctors':
        return this.doctorsService.search(params.q ?? '');
      case 'patients':
        return this.patientsService.search(params.q ?? '');
      case 'appointments':
        return this.appointmentsService.search(params);
      default:
        throw new BadRequestException('Unsupported entity for search');
    }
  }
}
