import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SigninUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
