import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsInt()
  @Min(0)
  yearsOfExperience: number;

  @IsOptional()
  availabilitySchedule?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
