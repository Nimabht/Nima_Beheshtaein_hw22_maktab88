import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from './../mail/mail.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthGuard as myAuthGuard } from './auth.guard';
import { SigninUserDto } from './dto/signin-auth.dto';
import { CreateGoogleUserDto } from 'src/user/dto/create-google-user.dto';
import { ResetPasswordDto } from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
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
    await this.userService.create(createUserDto);
    await this.authService.createEmailVerification(createUserDto.email, token);
    // await this.mailService.sendUserConfirmation(
    //   createUserDto.email,
    //   createUserDto.username,
    //   token,
    // );

    return 'Please confirm your email!';
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SigninUserDto, @Res() res: Response) {
    const user = await this.userService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect!');
    }

    if (!(await user.validatePassword(signInDto.password))) {
      throw new UnauthorizedException('Email or password is incorrect!');
    }

    if (!user.verified) {
      throw new UnauthorizedException('Please verify your email!');
    }

    const token = await this.authService.signIn(user);

    res.cookie('jwt', token, {
      httpOnly: false,
    });

    return res.status(HttpStatus.OK).send({ message: 'Login successful' });
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

  @Get('/googleLogin')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @HttpCode(HttpStatus.OK)
  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { email, firstName, lastName } = req.user;
    if (!(await this.userService.findByEmail(email))) {
      const information: CreateGoogleUserDto = {
        username: `${firstName}_${lastName}_${Date.now()}`,
        email,
      };
      await this.userService.create(information);
    }

    const user = await this.userService.findByEmail(email);
    const token = await this.authService.signIn(user);

    res.cookie('jwt', token, {
      httpOnly: false,
    });

    return res.status(HttpStatus.OK).redirect('/dashboard');
  }

  @Patch('/reset-password/:id')
  @UseGuards(myAuthGuard)
  async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = await this.userService.findById(+id);
    if (!user) throw new NotFoundException('user not found.');
    const userId = req.userPayload.id;
    if (userId !== id) throw new ForbiddenException();
    if (!(await user.validatePassword(resetPasswordDto.currentPassword))) {
      throw new ForbiddenException('Wrong current password.');
    }
    if (resetPasswordDto.newPassword !== resetPasswordDto.repeatNewPassword)
      throw new BadRequestException("new password doesn't match.");
    return await this.userService.resetPassword(
      id,
      resetPasswordDto.newPassword,
    );
  }
}
