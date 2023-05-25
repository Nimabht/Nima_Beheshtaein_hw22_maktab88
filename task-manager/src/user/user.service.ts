import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.verified = false;
    await user.hashPassword();
    const createdUser = await this.userRepository.save(user);
    return createdUser;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  findByUsername(username: string): Promise<User> {
    return this.userRepository.findOneBy({ username });
  }

  update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOneBy({ id });
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    user.password = newPassword;
    await user.hashPassword();
    await this.userRepository.save(user);
  }

  async verifyUser(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });
    user.verified = true;
    await this.userRepository.save(user);
  }
  remove(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }
}