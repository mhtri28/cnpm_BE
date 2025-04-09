import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { AuthGuard } from '../../guard/auth.guard';
import { RoleGuard } from '../../guard/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('tables')
@Controller('tables')
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth()
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mới bàn' })
  @ApiResponse({ status: 201, description: 'Tạo mới thành công' })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  @ApiOperation({ summary: 'Lấy danh sách tất cả các bàn' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một bàn' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Put(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin bàn' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Xóa một bàn' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
