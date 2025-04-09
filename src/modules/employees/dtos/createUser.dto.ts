import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { EmployeeRole } from '../entities/employee.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Tên đầy đủ của nhân viên',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Số điện thoại của nhân viên (định dạng Việt Nam)',
    example: '0912345678',
  })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;

  @ApiProperty({
    description: 'Địa chỉ email của nhân viên',
    example: 'nhanvien@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của nhân viên',
    example: 'password123',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Vai trò của nhân viên',
    enum: EmployeeRole,
    example: EmployeeRole.BARISTA,
  })
  @IsNotEmpty()
  @IsEnum(EmployeeRole)
  role: EmployeeRole;
}
