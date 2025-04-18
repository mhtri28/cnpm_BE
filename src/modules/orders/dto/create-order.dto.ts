import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID của đồ uống',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  drinkId: number;

  @ApiProperty({
    description: 'Số lượng đồ uống',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của bàn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  tableId: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    description: 'Danh sách các món trong đơn hàng',
    type: [CreateOrderItemDto],
    example: [
      {
        drinkId: 1,
        quantity: 2,
      },
      {
        drinkId: 2,
        quantity: 3,
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  orderItems: CreateOrderItemDto[];
}
