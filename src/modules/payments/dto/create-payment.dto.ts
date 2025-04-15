import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID của đơn hàng',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Tổng số tiền thanh toán',
    example: 29000,
  })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'cash',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({
    description: 'Trạng thái thanh toán',
    example: 'pending',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}