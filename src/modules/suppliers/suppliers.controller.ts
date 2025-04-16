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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Supplier } from './entities/supplier.entity';

@ApiTags('suppliers')
@Controller('suppliers')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth') // Keep only one ApiBearerAuth with the correct token name
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles(EmployeeRole.ADMIN) // Remove duplicate UseGuards since it's already in the controller level
  @ApiOperation({ summary: 'Tạo nhà cung cấp mới' })
  @ApiCreatedResponse({
    type: Supplier,
    description: 'Nhà cung cấp đã được tạo thành công',
  })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả nhà cung cấp' })
  @ApiOkResponse({
    type: [Supplier],
    description: 'Trả về danh sách tất cả nhà cung cấp',
  })
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin nhà cung cấp theo ID' })
  @ApiOkResponse({
    type: Supplier,
    description: 'Trả về thông tin nhà cung cấp',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin nhà cung cấp' })
  @ApiOkResponse({
    type: Supplier,
    description: 'Thông tin nhà cung cấp đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.updateById(id, updateSupplierDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Xóa nhà cung cấp' })
  @ApiOkResponse({ description: 'Nhà cung cấp đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.deleteById(id);
  }

  @Patch(':id/restore')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Khôi phục nhà cung cấp đã xóa' })
  @ApiOkResponse({
    type: Supplier,
    description: 'Nhà cung cấp đã được khôi phục',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà cung cấp' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.restore(id);
  }
}
