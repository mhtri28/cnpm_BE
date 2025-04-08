import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseIntPipe,
  Patch
} from '@nestjs/common';
import { CreateStockImportDto } from '../dto/create-stock-import.dto';
import { StockImportService } from './stock-import.service';
import { RoleGuard } from 'src/guard/role.guard';
import { EmployeeRole } from 'src/modules/employees/entities/employee.entity';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guard/auth.guard';
import { UpdateStockImportDto } from '../dto/update-stock-import.dto';

@Controller('stock-imports')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
export class StockImportController {
  constructor(private readonly stockImportService: StockImportService) {}

  @Post()
  @Roles(EmployeeRole.INVENTORY_MANAGER)
  create(@Body() createStockImportDto: CreateStockImportDto) {
    return this.stockImportService.create(createStockImportDto);
  }

  @Get()
  @Roles(EmployeeRole.INVENTORY_MANAGER)
  findAll() {
    return this.stockImportService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.INVENTORY_MANAGER)
  findOne(@Param('id') id: number) {
    return this.stockImportService.findOne(id);
  }

   @Put(':id')
   update(@Param('id') id: number, @Body() updateStockImportDto: UpdateStockImportDto) {
  return this.stockImportService.update(id, updateStockImportDto);
   }

  @Delete(':id')
  remove(@Param('id') id: number) {
     return this.stockImportService.remove(id);
   }

   @Patch(':id')
   restore(@Param('id', ParseIntPipe) id: number) {
    return this.stockImportService.restore(id);
  }
}
