import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsNumber()
  drinkId: number;

  @IsNotEmpty()
  @IsNumber()
  ingredientId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
} 