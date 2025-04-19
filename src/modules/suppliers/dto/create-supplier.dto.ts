import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Công ty TNHH Thực phẩm ABC',
  })
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @Length(3, 50, { message: 'Tên nhà cung cấp phải từ 3 đến 50 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Số điện thoại nhà cung cấp',
    example: '0123456789',
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone: string;

  @ApiProperty({
    description: 'Email nhà cung cấp',
    example: 'supplier@abc.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Địa chỉ nhà cung cấp',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @Length(5, 50, { message: 'Địa chỉ phải từ 5 đến 50 ký tự' })
  address: string;
}
