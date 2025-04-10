import { PartialType } from '@nestjs/mapped-types';
import { CreateDrinkDto, RecipeItemDto } from './create-drink.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDrinkDto extends PartialType(CreateDrinkDto) {
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
