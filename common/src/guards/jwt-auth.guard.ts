import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    // public paths: auth/* (register/login)
    const url = req.url;
    if (url.startsWith('/auth')) {
      return true;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader)
      throw new UnauthorizedException('Missing Authorization header');

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid token format');

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env['JWT_SECRET'] ?? 'supersecret',
      });
      // attach to request
      (req as any).user = payload;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
