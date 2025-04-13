import { IsEmail, IsNumber, IsPhoneNumber, MinLength } from 'class-validator';

import { Length } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Công ty TNHH Thực phẩm ABC',
  })
  name: string;

  @ApiProperty({
    description: 'Số điện thoại nhà cung cấp',
    example: '0123456789',
  })
  phone: string;

  @ApiProperty({
    description: 'Email nhà cung cấp',
    example: 'supplier@abc.com',
  })
  email: string;

  @ApiProperty({
    description: 'Địa chỉ nhà cung cấp',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  address: string;
}
