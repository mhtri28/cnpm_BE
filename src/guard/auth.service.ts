import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmployeesService } from 'src/modules/employees/employees.service';
import { LoginUserDto } from 'src/modules/employees/dtos/LoginUserDto';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { CreateUserDto } from 'src/modules/employees/dtos/createUser.dto';
import { RefreshTokenDto } from './dtos/refreshToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private employeeService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; access_token: string; refresh_token: string }> {
    // 1. Check if user already exists
    const existingUser = await this.employeeService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 3. Create new user with hashed password
    const newUserData = {
      ...createUserDto,
      password: hashedPassword,
    };

    // 4. Save user to database
    const createdUser = await this.employeeService.create(newUserData);
    const payload = {
      sub: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      role: createdUser.role, // Thêm thông tin role
    };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return {
      message: 'Đăng ký thành công',
      access_token,
      refresh_token,
    };
  }
  async signIn(
    requestBody: LoginUserDto,
  ): Promise<{ message: string; access_token: string; refresh_token: string }> {
    const user = await this.employeeService.findByEmail(requestBody.email);

    // 1. Kiểm tra user có tồn tại không
    if (!user) {
      throw new UnauthorizedException('User does not exist!');
    }

    // 2. Kiểm tra mật khẩu (đã mã hóa)
    const isPasswordMatch = await bcrypt.compare(
      requestBody.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Wrong password!');
    }

    // 3. Tạo payload để mã hóa JWT
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    // 4. Ký token
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    // 5. Trả kết quả
    return {
      message: 'Đăng nhập thành công',
      access_token,
      refresh_token,
    };
  }
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: process.env.JWT_SECRET,
      });

      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );

      return {
        message: 'Refresh token thành công',
        access_token: newAccessToken,
      };
    } catch (err) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}
