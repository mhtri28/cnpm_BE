import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CreateStockImportItemDto } from '../dto/create-stock-import-item.dto';
import { StockImportItemService } from './stock-import-item.service';

@Controller('stock-import-item')
export class StockImportItemController {
  constructor(private readonly stockImportItemService: StockImportItemService) {}  

  @Post()
  create(@Body() createStockImportItemDto: CreateStockImportItemDto) {
    return this.stockImportItemService.create(createStockImportItemDto);
  }

  @Get()
  findAll() {
    return this.stockImportItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.stockImportItemService.findOne(id);
  }

//   @Put(':id')
//   update(@Param('id') id: number, @Body() updateStockImportItemDto: UpdateStockImportItemDto) {
//     return this.stockImportItemService.update(id, updateStockImportItemDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: number) {
//     return this.stockImportItemService.remove(id);
//   }
}
