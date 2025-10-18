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
          // Проверяем наличие токена в куки
          const token = request?.cookies?.access_token;
          console.log('JWT Strategy: Extracting token from cookies:', token ? 'Token found' : 'No token');
          console.log('JWT Strategy: Available cookies:', Object.keys(request?.cookies || {}));
          return token || null;
        },
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
