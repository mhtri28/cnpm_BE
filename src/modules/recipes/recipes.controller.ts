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
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';
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

@ApiTags('recipes')
@Controller('recipes')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth()
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @ApiOperation({ summary: 'Tạo công thức mới' })
  @ApiResponse({ status: 201, description: 'Công thức đã được tạo thành công' })
  @Post()
  @Roles(EmployeeRole.BARISTA)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @ApiOperation({ summary: 'Lấy tất cả công thức' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách tất cả công thức',
  })
  @Get()
  @Roles(EmployeeRole.BARISTA)
  findAll() {
    return this.recipesService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin công thức theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin công thức' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  @Get(':id')
  @Roles(EmployeeRole.BARISTA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findById(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin công thức' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin công thức đã được cập nhật',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  @Put(':id')
  @Roles(EmployeeRole.BARISTA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.updateById(id, updateRecipeDto);
  }

  @ApiOperation({ summary: 'Xóa công thức' })
  @ApiResponse({ status: 200, description: 'Công thức đã được xóa mềm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  @Delete(':id')
  @Roles(EmployeeRole.BARISTA)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.deleteById(id);
  }

  @ApiOperation({ summary: 'Khôi phục công thức đã xóa' })
  @ApiResponse({ status: 200, description: 'Công thức đã được khôi phục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công thức' })
  @Patch(':id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.restore(id);
  }
}
