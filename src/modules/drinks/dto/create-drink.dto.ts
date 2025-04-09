import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDrinkDto {
  @ApiProperty({
    description: 'Tên của đồ uống',
    example: 'Cà phê sữa đá',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Giá của đồ uống',
    example: 29000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}
