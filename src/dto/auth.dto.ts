import { IsEmail, IsString, MinLength, IsEnum, Matches, MaxLength } from 'class-validator';

export enum UserRole {
  HR = 'HR',
  CANDIDATE = 'CANDIDATE',
  UNIVERSITY = 'UNIVERSITY'
}

export class RegisterDto {
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру' 
  })
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
