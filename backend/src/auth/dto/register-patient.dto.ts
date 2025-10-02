import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class RegisterPatientDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  contactInfo: string;
}
