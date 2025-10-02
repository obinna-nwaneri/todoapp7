import { Module } from '@nestjs/common';

import { AppointmentsModule } from '../appointments/appointments.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { PatientsModule } from '../patients/patients.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [DoctorsModule, PatientsModule, AppointmentsModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
