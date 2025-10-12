import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          // Отладочная информация
          console.log('JWT Strategy - Request cookies:', request?.cookies);
          console.log('JWT Strategy - Access token from cookie:', request?.cookies?.access_token);
          
          // Проверяем наличие токена в куки
          const token = request?.cookies?.access_token;
          if (token) {
            console.log('JWT Strategy - Token found in cookie:', token.substring(0, 20) + '...');
            return token;
          }
          
          console.log('JWT Strategy - No token found in cookies');
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
      issuer: 'smartmatch',
      audience: 'smartmatch-users',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Validating payload:', payload);
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      console.log('JWT Strategy - User not found for ID:', payload.sub);
      throw new UnauthorizedException();
    }
    console.log('JWT Strategy - User validated:', user);
    return user;
  }
}
