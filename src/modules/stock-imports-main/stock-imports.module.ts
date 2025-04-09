import { Module } from '@nestjs/common';
import { StockImportModule } from './stock-imports/stock-import.module';
import { StockImportItemModule } from './stock-import-item/stock-import-item.module';

@Module({
  imports: [StockImportModule, StockImportItemModule],
  exports: [StockImportModule, StockImportItemModule],
})
export class StockImportsModule {}
