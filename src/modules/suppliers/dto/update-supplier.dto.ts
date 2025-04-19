import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';
import { IsEmail, IsOptional, Length, Matches } from 'class-validator';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Công ty TNHH Thực phẩm ABC',
    required: false,
  })
  @IsOptional()
  @Length(3, 50, { message: 'Tên nhà cung cấp phải từ 3 đến 50 ký tự' })
  name?: string;

  @ApiProperty({
    description: 'Số điện thoại nhà cung cấp',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone?: string;

  @ApiProperty({
    description: 'Email nhà cung cấp',
    example: 'supplier@abc.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiProperty({
    description: 'Địa chỉ nhà cung cấp',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @IsOptional()
  @Length(5, 50, { message: 'Địa chỉ phải từ 5 đến 50 ký tự' })
  address?: string;
}
