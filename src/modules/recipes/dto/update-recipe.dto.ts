import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  drinkId?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  ingredientId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => Number(value))
  @Min(0.01)
  quantity?: number;
}
