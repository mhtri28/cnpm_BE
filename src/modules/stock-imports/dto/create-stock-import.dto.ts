import { IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockImportDto {
  @IsNumber()
  employeeId: number;

  @IsNumber()
  supplierId: number;

  @IsNumber()
  totalCost: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
