import { PartialType } from '@nestjs/mapped-types';
import { CreateDrinkDto, RecipeItemDto } from './create-drink.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDrinkDto extends PartialType(CreateDrinkDto) {
  @ApiProperty({
    description: 'Tên của đồ uống (tùy chọn)',
    example: 'Cà phê sữa đá',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Công thức của đồ uống (tùy chọn)',
    type: [RecipeItemDto],
    required: false,
    example: [
      {
        id: 1,
        quantity: 20,
      },
      {
        id: 3,
        quantity: 25,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipe?: RecipeItemDto[];
}
