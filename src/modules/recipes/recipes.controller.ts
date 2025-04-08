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

@Controller('recipes')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RoleGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @Roles(EmployeeRole.BARISTA)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @Roles(EmployeeRole.BARISTA)
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @Roles(EmployeeRole.BARISTA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findById(id);
  }

  @Put(':id')
  @Roles(EmployeeRole.BARISTA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.updateById(id, updateRecipeDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.BARISTA)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.deleteById(id);
  }

  @Patch(':id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.restore(id);
  }
}