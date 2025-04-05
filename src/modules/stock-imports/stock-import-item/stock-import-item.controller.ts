import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { CreateStockImportItemDto } from '../dto/create-stock-import-item.dto';
import { StockImportItemService } from './stock-import-item.service';
import { RoleGuard } from '../../../guard/role.guard';
import { EmployeeRole } from '../../employees/entities/employee.entity';
import { AuthGuard } from '../../../guard/auth.guard';
import { Roles } from '../../../decorators/role.decorator';

@Controller('stock-import-item')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
export class StockImportItemController {
  constructor(
    private readonly stockImportItemService: StockImportItemService,
  ) {}

  @Post()
  @Roles(EmployeeRole.INVENTORY_MANAGER)
  create(@Body() createStockImportItemDto: CreateStockImportItemDto) {
    return this.stockImportItemService.create(createStockImportItemDto);
  }

  @Get()
  @Roles(EmployeeRole.INVENTORY_MANAGER)
  findAll() {
    return this.stockImportItemService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.INVENTORY_MANAGER)
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
