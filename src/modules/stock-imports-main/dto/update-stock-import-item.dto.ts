import { IsNumber, Min } from "class-validator";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";


export class UpdateStockImportItemDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  ingredientId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  stockImportId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  supplierId?: number;
} 