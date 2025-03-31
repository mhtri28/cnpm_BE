import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        return null;
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Lỗi khi xác thực người dùng');
    }
  }

  async login(user: any) {
    try {
      this.logger.debug(`Attempting to login user: ${JSON.stringify(user)}`);

      if (!user || !user.id || !user.email) {
        this.logger.warn('Invalid user data received');
        throw new UnauthorizedException('Thông tin người dùng không hợp lệ');
      }

      if (!user.role?.name) {
        this.logger.warn(`User ${user.email} has no role assigned`);
        throw new UnauthorizedException('Người dùng chưa được phân quyền');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role.name
      };

      this.logger.debug(`Creating tokens with payload: ${JSON.stringify(payload)}`);

      try {
        const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.signAsync(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m'
          }),
          this.jwtService.signAsync(payload, {
            expiresIn: '7d'
          })
        ]);

        this.logger.debug('Tokens created successfully');

        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name
          }
        };
      } catch (jwtError) {
        this.logger.error(`JWT signing error: ${jwtError.message}`, jwtError.stack);
        throw new InternalServerErrorException('Lỗi khi tạo token');
      }
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi khi xử lý đăng nhập');
    }
  }

  async register(createUserDto: CreateUserDto) {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Tạo user mới
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Tạo token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' })
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      }
    };
  }

  async logout(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      await this.tokenBlacklistService.addToBlacklist(
        token,
        new Date(payload.exp * 1000)
      );
      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role.name
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(newPayload, { expiresIn: '15m' }),
        this.jwtService.signAsync(newPayload, { expiresIn: '7d' })
      ]);

      return {
        access_token: accessToken,
        refresh_token: refreshToken
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
