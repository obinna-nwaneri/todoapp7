import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  specialization!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;
}
