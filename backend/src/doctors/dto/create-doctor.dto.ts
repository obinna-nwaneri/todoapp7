import { IsInt, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDoctorDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  name: string;

  @IsString()
  specialization: string;

  @IsInt()
  @Min(0)
  yearsOfExperience: number;

  @IsOptional()
  @IsObject()
  availabilitySchedule?: Record<string, any>;
}
