import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Công ty TNHH Thực phẩm ABC',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Số điện thoại nhà cung cấp',
    example: '0123456789',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Email nhà cung cấp',
    example: 'supplier@abc.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Địa chỉ nhà cung cấp',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  address?: string;
}
