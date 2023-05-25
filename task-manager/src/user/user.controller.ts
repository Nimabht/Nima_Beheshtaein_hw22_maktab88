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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findById(+id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
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

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.remove(id);
    if (result.affected == 0) {
      throw new NotFoundException('User with given id does not exist.');
    }
    return null;
  }
}
