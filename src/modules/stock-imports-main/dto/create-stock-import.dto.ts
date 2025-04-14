import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class StockImportItemDto {
  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  ingredientId: number;

  @ApiProperty({
    description: 'Số lượng',
    example: 50.5
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Đơn giá',
    example: 25000
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateStockImportDto {
  @ApiProperty({
    description: 'ID của nhân viên',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @ApiProperty({
    description: 'Danh sách các mặt hàng nhập kho',
    type: [StockImportItemDto],
    example: [
      {
        ingredientId: 1,
        quantity: 50.5,
        unitPrice: 25000
      },
      {
        ingredientId: 2,
        quantity: 100.75,
        unitPrice: 15000
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockImportItemDto)
  stockImportItems: StockImportItemDto[];
}
