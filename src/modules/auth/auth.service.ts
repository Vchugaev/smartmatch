import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserRole } from '../../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, role } = registerDto;

    try {
      // Логирование попытки регистрации
      console.log(`Registration attempt for email: ${email}, role: ${role}`);

      // Проверяем, существует ли пользователь
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`Registration failed: User already exists for email: ${email}`);
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 12);

      // Создаем пользователя
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      // Генерируем JWT токен
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      };
      const accessToken = this.jwtService.sign(payload, {
        issuer: 'smartmatch',
        audience: 'smartmatch-users'
      });

      console.log(`User registered successfully: ${user.id}`);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Ошибка при создании пользователя');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Логирование попытки входа
    console.log(`Login attempt for email: ${email}`);

    // Находим пользователя
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Login failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Проверяем, активен ли пользователь
    if (!user.isActive) {
      console.log(`Login failed: User account is inactive for email: ${email}`);
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Обновляем время последнего входа
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Генерируем JWT токен
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    const accessToken = this.jwtService.sign(payload, {
      issuer: 'smartmatch',
      audience: 'smartmatch-users'
    });

    console.log(`User logged in successfully: ${user.id}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  }
}
