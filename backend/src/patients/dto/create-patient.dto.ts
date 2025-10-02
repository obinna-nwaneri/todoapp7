import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePatientDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  gender: string;

  @IsString()
  contactInfo: string;
}
