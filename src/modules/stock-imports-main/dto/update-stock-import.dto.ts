import { PartialType } from '@nestjs/mapped-types';
import { CreateStockImportDto } from './create-stock-import.dto';

export class UpdateStockImportDto extends PartialType(CreateStockImportDto) {}
