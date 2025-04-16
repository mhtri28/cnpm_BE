import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsDecimal,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateIngredientDto {
  @ApiProperty({
    description: 'Tên nguyên liệu',
    example: 'Coffee Beans',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Số lượng hiện có',
    example: 1000.5,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  availableCount: number;

  @ApiProperty({
    description: 'Đơn vị tính',
    example: 'gram',
  })
  @IsNotEmpty()
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  supplierId: number;
}
