import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { EmployeeRole } from '../entities/employee.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Mật khẩu của nhân viên',
    example: 'password123',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
    description: 'Mật khẩu của nhân viên (Không có thì giữ nguyên)',
    example: 'password123',
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Vai trò của nhân viên (Không có thì giữ nguyên)',
    enum: EmployeeRole,
    example: EmployeeRole.BARISTA,
  })
  @IsOptional()
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;
}
