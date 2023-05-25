import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';

@Entity()
export class GoogleUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  @IsString()
  username: string;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ nullable: false, default: true })
  @IsNotEmpty()
  @IsBoolean()
  verified: boolean;
}
