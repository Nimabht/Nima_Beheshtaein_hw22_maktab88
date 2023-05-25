import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';

@Entity()
export class EmailVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ unique: true, nullable: false })
  @IsNotEmpty()
  @IsString()
  emailToken: string;
}
