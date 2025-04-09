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
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';
import { RoleGuard } from 'src/guard/role.guard';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { Roles } from '../../decorators/role.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('ingredients')
@Controller('ingredients')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth()
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @ApiOperation({ summary: 'Tạo nguyên liệu mới' })
  @ApiResponse({
    status: 201,
    description: 'Nguyên liệu đã được tạo thành công',
  })
  @Post()
  @Roles(EmployeeRole.ADMIN)
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @ApiOperation({ summary: 'Lấy tất cả nguyên liệu' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách tất cả nguyên liệu',
  })
  @Get()
  @Roles(EmployeeRole.ADMIN)
  findAll() {
    return this.ingredientsService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin nguyên liệu theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin nguyên liệu' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findById(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin nguyên liệu' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin nguyên liệu đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  @Put(':id')
  @Roles(EmployeeRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateById(id, updateIngredientDto);
  }

  @ApiOperation({ summary: 'Xóa nguyên liệu' })
  @ApiResponse({ status: 200, description: 'Nguyên liệu đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.deleteById(id);
  }

  @ApiOperation({ summary: 'Khôi phục nguyên liệu đã xóa' })
  @ApiResponse({ status: 200, description: 'Nguyên liệu đã được khôi phục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  @Patch(':id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.restore(id);
  }
}
