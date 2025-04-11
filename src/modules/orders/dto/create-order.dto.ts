import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  drinkId: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  tableId: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1)
  orderItems: CreateOrderItemDto[];
}
