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
        // Сначала пробуем извлечь из заголовка Authorization (приоритет для cross-origin)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Затем из куки
        (request: Request) => {
          const token = request?.cookies?.access_token;
          console.log('JWT Strategy: Extracting token from cookies:', token ? 'Token found' : 'No token');
          console.log('JWT Strategy: Available cookies:', Object.keys(request?.cookies || {}));
          console.log('JWT Strategy: Authorization header:', request?.headers?.authorization);
          return token || null;
        },
        // Также пробуем из query параметра (для отладки)
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
      issuer: 'smartmatch',
      audience: 'smartmatch-users',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy: Validating payload:', { sub: payload.sub, email: payload.email, role: payload.role });
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      console.log('JWT Strategy: User not found for ID:', payload.sub);
      throw new UnauthorizedException();
    }
    console.log('JWT Strategy: User validated successfully:', { id: user.id, email: user.email, role: user.role });
    return user;
  }
}
