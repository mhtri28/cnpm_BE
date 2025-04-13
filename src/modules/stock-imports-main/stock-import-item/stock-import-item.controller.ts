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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StockImportItem } from '../entities/stock-import-item.entity';

@ApiTags('stock-import-items')
@Controller('stock-import-items')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth')
export class StockImportItemController {
  constructor(
    private readonly stockImportItemService: StockImportItemService,
  ) {}

  @Post()
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Tạo chi tiết phiếu nhập kho mới' })
  @ApiCreatedResponse({
    type: StockImportItem,
    description: 'Chi tiết phiếu nhập kho đã được tạo thành công',
  })
  create(@Body() createStockImportItemDto: CreateStockImportItemDto) {
    return this.stockImportItemService.create(createStockImportItemDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả chi tiết phiếu nhập kho' })
  @ApiOkResponse({
    type: [StockImportItem],
    description: 'Trả về danh sách tất cả chi tiết phiếu nhập kho',
  })
  findAll() {
    return this.stockImportItemService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết phiếu nhập kho theo ID' })
  @ApiOkResponse({
    type: StockImportItem,
    description: 'Trả về thông tin chi tiết phiếu nhập kho',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết phiếu nhập kho' })
  findOne(@Param('id') id: string) {
    return this.stockImportItemService.findOne(id);
  }

  @Put(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin chi tiết phiếu nhập kho' })
  @ApiOkResponse({
    type: StockImportItem,
    description: 'Thông tin chi tiết phiếu nhập kho đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết phiếu nhập kho' })
  update(
    @Param('id') id: string,
    @Body() updateStockImportItemDto: UpdateStockImportItemDto,
  ) {
    return this.stockImportItemService.update(id, updateStockImportItemDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Xóa chi tiết phiếu nhập kho' })
  @ApiOkResponse({ description: 'Chi tiết phiếu nhập kho đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết phiếu nhập kho' })
  remove(@Param('id') id: string) {
    return this.stockImportItemService.remove(id);
  }

  @Patch(':id/restore')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Khôi phục chi tiết phiếu nhập kho đã xóa' })
  @ApiOkResponse({
    type: StockImportItem,
    description: 'Chi tiết phiếu nhập kho đã được khôi phục',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi tiết phiếu nhập kho' })
  restore(@Param('id') id: string) {
    return this.stockImportItemService.restore(id);
  }
}
