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

@Controller('ingredients')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(EmployeeRole.ADMIN)
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @Roles(EmployeeRole.ADMIN)
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findById(id);
  }

  @Put(':id')
  @Roles(EmployeeRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateById(id, updateIngredientDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.deleteById(id);
  }
} 