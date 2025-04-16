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
@ApiBearerAuth('JWT-auth')
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
  }

  @Get('deleted')  // Di chuyển route này lên trước các routes có param :id
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách nhà cung cấp đã xóa' })
  @ApiOkResponse({
    type: [Supplier],
    description: 'Trả về danh sách các nhà cung cấp đã bị xóa',
  })
  findAllDeleted() {
    return this.supplierService.findAllDeleted();
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')  // Các routes có param :id đặt sau
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
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
