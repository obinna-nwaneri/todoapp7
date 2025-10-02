import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { AppointmentStatus } from '../appointment-status.enum';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  symptoms: string;

  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
