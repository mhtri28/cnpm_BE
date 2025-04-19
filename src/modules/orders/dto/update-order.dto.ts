import { IsEnum, IsNotEmpty, IsEmpty } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Trạng thái của đơn hàng',
    example: 'pending',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    type: 'string',
    required: true,
  })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  // These fields must not be provided in this DTO
  @IsEmpty({ message: 'tableId should not be provided in UpdateOrderDto' })
  tableId?: string;

  @IsEmpty({ message: 'orderItems should not be provided in UpdateOrderDto' })
  orderItems?: any[];
}
