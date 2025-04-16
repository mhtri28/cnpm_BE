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
  Patch,
} from '@nestjs/common';
import { CreateStockImportDto } from '../dto/create-stock-import.dto';
import { StockImportService } from './stock-import.service';
import { RoleGuard } from 'src/guard/role.guard';
import { EmployeeRole } from 'src/modules/employees/entities/employee.entity';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guard/auth.guard';
import { UpdateStockImportDto } from '../dto/update-stock-import.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('stock-imports') 
@Controller('stock-imports')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth') // Remove duplicate ApiBearerAuth
export class StockImportController {
  constructor(private readonly stockImportService: StockImportService) {}

  @ApiOperation({ summary: 'Tạo phiếu nhập kho mới' })
  @ApiResponse({
    status: 201,
    description: 'Phiếu nhập kho đã được tạo thành công',
  })
  @Post()
  @Roles(EmployeeRole.ADMIN)
  create(@Body() createStockImportDto: CreateStockImportDto) {
    return this.stockImportService.create(createStockImportDto);
  }

  @ApiOperation({ summary: 'Lấy tất cả phiếu nhập kho' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách tất cả phiếu nhập kho',
  })
  @Get()
  @Roles(EmployeeRole.ADMIN)
  findAll() {
    return this.stockImportService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin phiếu nhập kho theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin phiếu nhập kho' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu nhập kho' })
  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.stockImportService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin phiếu nhập kho' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin phiếu nhập kho đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu nhập kho' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockImportDto: UpdateStockImportDto,
  ) {
    return this.stockImportService.update(id, updateStockImportDto);
  }

  @ApiOperation({ summary: 'Xóa phiếu nhập kho' })
  @ApiResponse({ status: 200, description: 'Phiếu nhập kho đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu nhập kho' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockImportService.remove(id);
  }

  @ApiOperation({ summary: 'Khôi phục phiếu nhập kho đã xóa' })
  @ApiResponse({ status: 200, description: 'Phiếu nhập kho đã được khôi phục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phiếu nhập kho' })
  @Patch(':id')
  restore(@Param('id') id: string) {
    return this.stockImportService.restore(id);
  }
}
