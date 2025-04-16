import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'ID của đồ uống',
    example: '1',
  })
  @IsNumber()
  drinkId: number;

  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1,
  })
  @IsNumber()
  ingredientId: number;

  @ApiProperty({
    description: 'Số lượng nguyên liệu cần dùng',
    example: 20.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => Number(value))
  @Min(0.01)
  quantity: number;

  @ApiProperty({
    description: 'Đơn vị tính',
    example: 'gram',
  })
  @IsString()
  unit: string;
}
