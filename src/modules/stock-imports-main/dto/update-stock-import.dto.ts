import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateStockImportDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  importDate?: Date;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  employeeId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  supplierId?: number;
} 