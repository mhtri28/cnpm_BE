import { PartialType } from '@nestjs/mapped-types';
import { CreateDrinkDto, RecipeItemDto } from './create-drink.dto';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
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
    description: 'Ảnh của đồ uống (tùy chọn)',
    example: 'https://example.com/images/drink.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({
    description: 'Giá của đồ uống (tùy chọn)',
    example: 29000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

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
  @ArrayMinSize(1)
  @Type(() => RecipeItemDto)
  recipe?: RecipeItemDto[];
}
