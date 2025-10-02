import { IsEnum } from 'class-validator';

import { AppointmentStatus } from '../appointment-status.enum';

export class UpdateStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
