import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierService } from './suppliers.service';
import { RoleGuard } from '../../guard/role.guard';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { Roles } from '../../decorators/role.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('suppliers')
@Controller('suppliers')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@Roles(EmployeeRole.INVENTORY_MANAGER)
@ApiBearerAuth()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @ApiOperation({ summary: 'Tạo nhà cung cấp mới' })
  @ApiResponse({
    status: 201,
    description: 'Nhà cung cấp đã được tạo thành công',
  })
  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @ApiOperation({ summary: 'Lấy tất cả nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách tất cả nhà cung cấp',
  })
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.INVENTORY_MANAGER)
  findAll() {
    return this.supplierService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin nhà cung cấp theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin nhà cung cấp' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findById(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin nhà cung cấp đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.updateById(id, updateSupplierDto);
  }

  @ApiOperation({ summary: 'Xóa nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Nhà cung cấp đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.deleteById(id);
  }

  @ApiOperation({ summary: 'Khôi phục nhà cung cấp đã xóa' })
  @ApiResponse({ status: 200, description: 'Nhà cung cấp đã được khôi phục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  @Patch(':id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.restore(id);
  }
}
