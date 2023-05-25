import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailVerification } from './entities/user.entity';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { MailModule } from 'src/mail/mail.module';
import { GoogleStrategy } from './google.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'dev.env',
    }),
    UserModule,
    SendgridModule,
    MailModule,
    TypeOrmModule.forFeature([EmailVerification]),
  ],
})
export class AuthModule {}
