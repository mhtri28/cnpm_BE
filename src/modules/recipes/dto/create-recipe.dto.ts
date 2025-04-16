import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'ID của đồ uống',
    example: '1',
  })
  drinkId: number;

  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1,
  })
  ingredientId: number;

  @ApiProperty({
    description: 'Số lượng nguyên liệu cần dùng',
    example: 20,
  })
  quantity: number;

  @ApiProperty({
    description: 'Đơn vị tính',
    example: 'gram',
  })
  unit: string;
}
