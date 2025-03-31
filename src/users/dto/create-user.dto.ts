import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Tên người dùng',
    example: 'John Doe',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789',
    maxLength: 10
  })
  @IsString()
  @MaxLength(10)
  phone: string;

  @ApiProperty({
    description: 'Email',
    example: 'john@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'ID của role',
    example: 1
  })
  @IsOptional()
  roleId?: number;
}
