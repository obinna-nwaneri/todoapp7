import {
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

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
