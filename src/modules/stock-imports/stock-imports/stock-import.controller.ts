import { Controller, Get, Param, Post, Put, Delete, Body } from '@nestjs/common';
import { CreateStockImportDto } from '../dto/create-stock-import.dto';
import { StockImportService } from './stock-import.service';

@Controller('stock-imports')
export class StockImportController {
  constructor(private readonly stockImportService: StockImportService) {}

  @Post()
  create(@Body() createStockImportDto: CreateStockImportDto) {
    return this.stockImportService.create(createStockImportDto);
  }

  @Get()
  findAll() {
    return this.stockImportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.stockImportService.findOne(id);
  }

  // @Put(':id')
  // update(@Param('id') id: number, @Body() updateStockImportDto: UpdateStockImportDto) {
  //   return this.stockImportService.update(id, updateStockImportDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.stockImportService.remove(id);
  // }
}
