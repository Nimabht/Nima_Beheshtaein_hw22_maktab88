import { Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendgridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }
  async sendVerificationMail(mail: SendGrid.MailDataRequired) {
    await SendGrid.send(mail);
    // avoid this on production. use log instead :)
    console.log(`E-Mail sent to ${mail.to}`);
  }
}
