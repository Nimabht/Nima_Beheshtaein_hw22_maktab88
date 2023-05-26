import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ConflictException,
  NotFoundException,
  HttpCode,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IsNull } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.userPayload.id;
    if (userId !== id) throw new ForbiddenException();
    const user = await this.userService.findById(+id);
    if (!user) throw new NotFoundException('user not found.');
    return user;
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.userService.findById(+id);
    if (!user) throw new NotFoundException('user not found.');
    const userId = req.userPayload.id;
    if (userId !== id) throw new ForbiddenException();
    if (!!updateUserDto.email) {
      const existingUser = await this.userService.findByEmail(
        updateUserDto.email,
      );
      if (!!existingUser) throw new ConflictException('Try another email.');
    }
    if (!!updateUserDto.username) {
      const existingUser = await this.userService.findByUsername(
        updateUserDto.username,
      );
      if (!!existingUser) throw new ConflictException('Try another username.');
    }
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = await this.userService.findById(+id);
    if (!user) throw new NotFoundException('user not found.');
    const userId = req.userPayload.id;
    if (userId !== id) throw new ForbiddenException();
    await this.userService.remove(id);
    return IsNull;
  }
}
