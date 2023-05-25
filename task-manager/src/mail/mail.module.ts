import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        port: 25,
        secure: false,
        auth: {
          user: 'apikey',
          pass: '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',
        },
      },
      defaults: {
        from: '"No Reply"',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
