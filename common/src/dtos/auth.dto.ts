import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@eams/database';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
