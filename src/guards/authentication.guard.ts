import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Invalid token');
    }

    console.log('Token:', token);
    try {
      const decoded = this.jwtService.verify(token);
      console.log('Decoded:', decoded);
      request.user = {
        userId: decoded.userId,
        fullname: decoded.fullname,
        email: decoded.email,
        role: decoded.role,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}
