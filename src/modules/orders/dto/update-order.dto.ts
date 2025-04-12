import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: 'Trạng thái của đơn hàng',
    example: 'pending',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    type: 'string',
    required: true,
  })
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
