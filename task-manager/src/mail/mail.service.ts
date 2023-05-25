import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(email: string, username: string, token: string) {
    const url = `http://localhost:3000/email/verify/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your Email',
      template: './confirmation',
      context: {
        username: username,
        url,
      },
    });
    console.log(`[I] Email sent to ${email}`);
  }
}
