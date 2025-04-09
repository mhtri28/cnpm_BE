import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

// Định nghĩa interface cho payload của JWT token
interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  [key: string]: any;
}

// Mở rộng kiểu Request để thêm thuộc tính currentUser
interface CurrentUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

declare module 'express' {
  interface Request {
    currentUser?: CurrentUser;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      // Xác thực token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      this.logger.debug(`Token payload: ${JSON.stringify(payload)}`);

      // Lấy thông tin user từ AuthService
      const user = await this.authService.validateUser(payload.sub);

      if (!user) {
        throw new BadRequestException(
          'User not belong to token, please try again!',
        );
      }

      this.logger.debug(`User from database: ${JSON.stringify(user)}`);

      // Lưu thông tin user vào request
      request.currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };

      this.logger.debug(
        `Current user set: ${JSON.stringify(request.currentUser)}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Authentication failed: ${errorMessage}`);
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
