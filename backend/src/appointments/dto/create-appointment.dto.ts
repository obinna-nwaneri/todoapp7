import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

export class CreateAppointmentDto {
  @IsInt()
  doctorId!: number;

  @IsInt()
  patientId!: number;

  @IsDateString()
  date!: string;

  @IsString()
  time!: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
