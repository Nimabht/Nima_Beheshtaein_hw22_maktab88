import { Injectable } from '@nestjs/common';
import { EmailVerification } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as SendGrid from '@sendgrid/mail';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { GoogleUser } from 'src/user/entities/googleUser.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private readonly configService: ConfigService,
  ) {
    SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }

  generateVerificationToken(email: string): string {
    const token = sign({ email }, process.env.EMAIL_TOKEN_SECRET, {
      expiresIn: '2d',
    });
    return token;
  }

  async createEmailVerification(
    email: string,
    token: string,
  ): Promise<EmailVerification> {
    const emailVerification = new EmailVerification();
    emailVerification.email = email;
    emailVerification.emailToken = token;
    const createdEmailVerification =
      await this.emailVerificationRepository.save(emailVerification);
    return createdEmailVerification;
  }

  findEmailVerificationByToken(emailToken: string): Promise<EmailVerification> {
    return this.emailVerificationRepository.findOneBy({ emailToken });
  }
  async verifyEmail(emailVerification: EmailVerification, emailToken: string) {
    const decoded = verify(emailToken, process.env.EMAIL_TOKEN_SECRET) as {
      email: string;
    };

    if (emailVerification.email !== decoded.email) return false;
    await this.emailVerificationRepository.delete(emailVerification.id);
    return true;
  }

  async signIn(user: User | GoogleUser): Promise<any> {
    let payload: object;
    if (user instanceof GoogleUser) {
      payload = { id: user.id, loginMethod: 'google' };
    } else {
      // The user is a regular User
      payload = { id: user.id, loginMethod: 'manual' };
    }

    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
