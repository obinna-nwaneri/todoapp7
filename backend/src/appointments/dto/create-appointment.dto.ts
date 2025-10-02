import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

const STATUS_OPTIONS: AppointmentStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  symptoms: string;

  @IsOptional()
  @IsIn(STATUS_OPTIONS)
  status?: AppointmentStatus;
}
