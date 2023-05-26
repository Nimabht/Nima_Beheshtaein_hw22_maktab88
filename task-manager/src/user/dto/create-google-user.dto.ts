import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateGoogleUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  constructor(partial: Partial<CreateGoogleUserDto>) {
    Object.assign(this, partial);
  }
}
