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

@Injectable()
export class AuthService {
  constructor(
    private employeeService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; user: Employee }> {
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

    // 5. Remove password from response
    const { password, ...result } = createdUser;

    // 6. Return success message and user data
    return {
      message: 'Employee registered successfully',
      user: result as Employee,
    };
  }
  async signIn(
    requestBody: LoginUserDto,
  ): Promise<{ message: string; access_token: string }> {
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
    };

    // 4. Ký token
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    // 5. Trả kết quả
    return {
      message: 'Đăng nhập thành công',
      access_token,
    };
  }
}
