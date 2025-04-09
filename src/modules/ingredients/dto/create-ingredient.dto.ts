import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIngredientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  availableCount: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  supplierId: number;
}
