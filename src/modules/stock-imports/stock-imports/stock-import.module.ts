import { Module } from '@nestjs/common';
import { StockImportController } from './stock-import.controller';
import { StockImportService } from './stock-import.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockImport } from '../entities/stock-import.entity';
import { StockImportItem } from '../entities/stock-import-item.entity';
import { GuardModule } from 'src/guard/guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockImport, StockImportItem]),
    GuardModule,
  ],
  providers: [StockImportService],
  controllers: [StockImportController],
})
export class StockImportModule {}
