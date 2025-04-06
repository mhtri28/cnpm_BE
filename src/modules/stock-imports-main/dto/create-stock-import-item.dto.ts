import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateStockImportItemDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  ingredientId: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  stockImportId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0) // Đảm bảo giá không âm
  @Transform(({ value }) => Number(value))
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1) // Đảm bảo số lượng ít nhất là 1
  @Transform(({ value }) => Number(value))
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0) // Đảm bảo tổng giá trị không âm
  @Transform(({ value }) => Number(value))
  subTotal: number;
}
