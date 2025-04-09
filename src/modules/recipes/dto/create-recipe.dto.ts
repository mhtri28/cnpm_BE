import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  drinkId: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  ingredientId: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(1)
  quantity: number;
}
