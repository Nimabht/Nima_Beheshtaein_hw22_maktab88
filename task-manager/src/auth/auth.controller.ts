import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from './../mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    if (!!(await this.userService.findByEmail(createUserDto.email))) {
      throw new BadRequestException('Try another email.');
    }
    if (!!(await this.userService.findByUsername(createUserDto.username))) {
      throw new BadRequestException('Try another username.');
    }
    if (createUserDto.password !== createUserDto.repeatPassword) {
      throw new BadRequestException("Passwords doesn't match.");
    }
    const token = this.authService.generateVerificationToken(
      createUserDto.email,
    );
    await this.authService.createEmailVerification(createUserDto.email, token);
    await this.userService.create(createUserDto);
    await this.mailService.sendUserConfirmation(
      createUserDto.email,
      createUserDto.username,
      token,
    );

    return 'Please confirm your email!';
  }

  @Get('/email/verify/:emailToken')
  async verifyEmail(@Param('emailToken') emailToken: string) {
    const emailVerification =
      await this.authService.findEmailVerificationByToken(emailToken);
    if (!emailVerification)
      throw new NotFoundException('Token does not exist.');
    const isVerified = await this.authService.verifyEmail(
      emailVerification,
      emailToken,
    );
    if (!isVerified) throw new BadRequestException('Invalid token.');
    await this.userService.verifyUser(emailVerification.email);
    return 'Email verified successfully.';
  }
}
