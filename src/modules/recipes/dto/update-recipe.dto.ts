import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsNumber()
  drinkId?: number;

  @IsOptional()
  @IsNumber()
  ingredientId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
} 