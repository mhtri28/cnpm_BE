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
  Patch,
} from '@nestjs/common';
import { CreateStockImportItemDto } from '../dto/create-stock-import-item.dto';
import { StockImportItemService } from './stock-import-item.service';
import { RoleGuard } from '../../../guard/role.guard';
import { EmployeeRole } from '../../employees/entities/employee.entity';
import { AuthGuard } from '../../../guard/auth.guard';
import { Roles } from '../../../decorators/role.decorator';
import { UpdateStockImportItemDto } from '../dto/update-stock-import-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('stock-import-items')
@ApiBearerAuth('JWT-auth')
@Controller('stock-import-item')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
export class StockImportItemController {
  constructor(
    private readonly stockImportItemService: StockImportItemService,
  ) {}

  @Post()
  @Roles(EmployeeRole.ADMIN)
  create(@Body() createStockImportItemDto: CreateStockImportItemDto) {
    return this.stockImportItemService.create(createStockImportItemDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN)
  findAll() {
    return this.stockImportItemService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.stockImportItemService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockImportItemDto: UpdateStockImportItemDto,
  ) {
    return this.stockImportItemService.update(id, updateStockImportItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockImportItemService.remove(id);
  }

  @Patch(':id')
  restore(@Param('id') id: string) {
    return this.stockImportItemService.restore(id);
  }
}
