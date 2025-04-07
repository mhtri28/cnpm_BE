import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockImportItem } from '../entities/stock-import-item.entity';
import { StockImport } from '../entities/stock-import.entity';
import { StockImportItemController } from './stock-import-item.controller';
import { StockImportItemService } from './stock-import-item.service';
import { GuardModule } from '../../../guard/guard.module';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockImport, StockImportItem, Ingredient]),
    GuardModule,
  ],
  providers: [StockImportItemService],
  controllers: [StockImportItemController],
})
export class StockImportItemModule {}
