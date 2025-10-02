import { IsEmail, IsInt, IsString, Min, MinLength } from 'class-validator';

export class RegisterPatientDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

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
