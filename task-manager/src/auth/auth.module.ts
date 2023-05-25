import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailVerification } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'dev.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    MailModule,
    TypeOrmModule.forFeature([EmailVerification]),
  ],
})
export class AuthModule {}
