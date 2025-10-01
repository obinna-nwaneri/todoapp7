import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AppointmentStatus } from '../appointment-status.enum';

export class CreateAppointmentDto {
  @IsInt()
  @Min(1)
  doctorId: number;

  @IsInt()
  @Min(1)
  patientId: number;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
