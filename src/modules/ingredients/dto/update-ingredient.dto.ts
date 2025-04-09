import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(0)
  availableCount?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  supplierId?: number;
}
