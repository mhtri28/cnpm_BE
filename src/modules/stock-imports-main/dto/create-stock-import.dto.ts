import { IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
export class CreateStockImportDto {
  @IsNumber()
  employeeId: number;

  @IsNumber()
  supplierId: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
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
