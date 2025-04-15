import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Đăng nhập bằng email của nhân viên',
    example: 'admin@coffee.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của nhân viên',
    example: 'password123',
  })
  @IsNotEmpty()
  password: string;
}
