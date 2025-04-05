import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateStockImportItemDto {
  @IsNumber()
  @IsNotEmpty()
  ingredientId: number;

  @IsNumber()
  @IsNotEmpty()
  stockImportId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0) // Đảm bảo giá không âm
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1) // Đảm bảo số lượng ít nhất là 1
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0) // Đảm bảo tổng giá trị không âm
  subTotal: number;
}
