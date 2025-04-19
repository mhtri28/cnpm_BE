import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrderStatus } from '../../orders/entities/order.entity';
import { Type } from 'class-transformer';
import { OrderSort } from '../../orders/dto/filter/filter-orders.dto';

export class FilterTableOrdersDto {
  @ApiProperty({
    description: 'Lọc theo trạng thái đơn hàng',
    required: false,
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: 'Sắp xếp theo trường và hướng',
    required: false,
    enum: OrderSort,
    default: [OrderSort.STATUS_ASC, OrderSort.CREATED_AT_DESC].join(','),
    example: OrderSort.CREATED_AT_DESC,
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng kết quả trên mỗi trang',
    required: false,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Bao gồm đơn hàng đã hủy trong kết quả',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  withCanceled?: boolean = false;
}
