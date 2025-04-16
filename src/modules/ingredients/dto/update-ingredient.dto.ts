import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateIngredientDto {
  @ApiProperty({
    description: 'Tên nguyên liệu',
    example: 'Coffee Beans',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Số lượng hiện có',
    example: 1000.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  availableCount?: number;

  @ApiProperty({
    description: 'Đơn vị tính',
    example: 'gram',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplierId?: number;
}
