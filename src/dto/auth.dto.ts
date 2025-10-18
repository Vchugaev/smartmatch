import { IsEmail, IsString, MinLength, IsEnum, Matches, MaxLength } from 'class-validator';

export enum UserRole {
  HR = 'HR',
  CANDIDATE = 'CANDIDATE',
  UNIVERSITY = 'UNIVERSITY'
}

export class RegisterDto {
  @IsString({ message: 'Email должен быть строкой' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символа' })
  password: string;

  @IsEnum(UserRole, { message: 'Роль должна быть одной из: HR, CANDIDATE, UNIVERSITY' })
  role: UserRole;
}

export class LoginDto {
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(1, { message: 'Пароль не может быть пустым' })
  password: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
