import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecipeItemDto {
  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Số lượng nguyên liệu cần dùng',
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateDrinkDto {
  @ApiProperty({
    description: 'Tên của đồ uống',
    example: 'Cà phê sữa đá',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Ảnh của đồ uống',
    example: 'https://example.com/images/drink.jpg',
  })
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @ApiProperty({
    description: 'Giá của đồ uống',
    example: 29000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Công thức của đồ uống',
    type: [RecipeItemDto],
    example: [
      {
        id: 1,
        quantity: 15,
      },
      {
        id: 2,
        quantity: 30,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => RecipeItemDto)
  recipe: RecipeItemDto[];
}
