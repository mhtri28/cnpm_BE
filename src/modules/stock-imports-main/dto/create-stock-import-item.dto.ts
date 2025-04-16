import { ApiProperty } from '@nestjs/swagger';

export class CreateStockImportItemDto {
  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1,
  })
  ingredientId: number;

  @ApiProperty({
    description: 'ID của phiếu nhập kho',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  stockImportId: string;

  @ApiProperty({
    description: 'Số lượng nhập',
    example: 100,
  })
  quantity: number;

  @ApiProperty({
    description: 'Đơn giá nhập',
    example: 50000.0,
    type: 'number',
    format: 'decimal',
  })
  unitPrice: number;
}
