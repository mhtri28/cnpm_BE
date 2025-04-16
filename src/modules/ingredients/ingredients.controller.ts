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
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Ingredient } from './entities/ingredient.entity';

@ApiTags('ingredients')
@Controller('ingredients')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth('JWT-auth') // Update to match token name
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Tạo nguyên liệu mới' })
  @ApiCreatedResponse({
    type: Ingredient,
    description: 'Nguyên liệu đã được tạo thành công',
  })
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy tất cả nguyên liệu' })
  @ApiOkResponse({
    type: [Ingredient],
    description: 'Trả về danh sách tất cả nguyên liệu',
  })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Lấy thông tin nguyên liệu theo ID' })
  @ApiOkResponse({
    type: Ingredient,
    description: 'Trả về thông tin nguyên liệu',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findById(id);
  }

  @Put(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin nguyên liệu' })
  @ApiOkResponse({
    type: Ingredient,
    description: 'Thông tin nguyên liệu đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateById(id, updateIngredientDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Xóa nguyên liệu' })
  @ApiOkResponse({ description: 'Nguyên liệu đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.deleteById(id);
  }

  @Patch(':id/restore')
  @Roles(EmployeeRole.ADMIN)
  @ApiOperation({ summary: 'Khôi phục nguyên liệu đã xóa' })
  @ApiOkResponse({
    type: Ingredient,
    description: 'Nguyên liệu đã được khôi phục',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nguyên liệu' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.restore(id);
  }
}
