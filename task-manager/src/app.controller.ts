import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get('signup')
  @Render('signup')
  signup(@Req() req: Request, @Res() res: Response) {
    if (!!req.cookies.jwt) {
      try {
        verify(req.cookies.jwt, process.env.JWT_SECRET);
        return res.redirect('/dashboard');
      } catch (error) {
        res.clearCookie('jwt');
        return res.redirect('/login');
      }
    }
    return null;
  }

  @Get('login')
  @Render('login')
  login(@Req() req: Request, @Res() res: Response) {
    if (!!req.cookies.jwt) {
      try {
        verify(req.cookies.jwt, process.env.JWT_SECRET);
        return res.redirect('/dashboard');
      } catch (error) {
        res.clearCookie('jwt');
        return res.redirect('/login');
      }
    }
    return null;
  }

  @Get('dashboard')
  @Render('dashboard')
  async dashboard(@Req() req: Request, @Res() res: Response) {
    if (!req.cookies.jwt) {
      return res.redirect('/login');
    }
    try {
      const decoded: any = verify(req.cookies.jwt, process.env.JWT_SECRET);
      const user = await this.userService.findById(+decoded.id);
      return { user };
    } catch (error) {
      res.clearCookie('jwt');
      return res.redirect('/login');
    }
  }

  @Get('reset-password')
  @Render('reset-password')
  async resetPassword(@Req() req: Request, @Res() res: Response) {
    if (!req.cookies.jwt) {
      return res.redirect('/login');
    }
    try {
      const decoded: any = verify(req.cookies.jwt, process.env.JWT_SECRET);
      const user = await this.userService.findById(+decoded.id);
      return { userId: user.id };
    } catch (error) {
      res.clearCookie('jwt');
      return res.redirect('/login');
    }
  }

  @Get('test')
  getHello(@Req() req: Request): string {
    if (!req.cookies.jwt) {
      throw new UnauthorizedException();
    }

    const decoded = verify(req.cookies.jwt, process.env.JWT_SECRET);

    return 'bashe';
  }
}
