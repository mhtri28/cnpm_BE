import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DrinksService } from './drinks.service';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Drink } from './entities/drink.entity';
import { AuthGuard } from '../../guard/auth.guard';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { Roles } from '../../decorators/role.decorator';
import { RoleGuard } from '../../guard/role.guard';

@ApiTags('Đồ uống')
@Controller('drinks')
export class DrinksController {
  constructor(private readonly drinksService: DrinksService) {}

  @Post()
  @Roles(EmployeeRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Tạo đồ uống mới' })
  @ApiCreatedResponse({
    description: 'Đồ uống đã được tạo thành công',
    type: Drink,
  })
  @ApiBearerAuth()
  create(@Body() createDrinkDto: CreateDrinkDto) {
    return this.drinksService.create(createDrinkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả đồ uống' })
  @ApiOkResponse({
    description: 'Danh sách đồ uống',
    type: [Drink],
  })
  findAll() {
    return this.drinksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một đồ uống theo ID' })
  @ApiParam({ name: 'id', description: 'ID của đồ uống' })
  @ApiOkResponse({
    description: 'Thông tin chi tiết của đồ uống',
    type: Drink,
  })
  findOne(@Param('id') id: string) {
    return this.drinksService.findOne(+id);
  }

  @Patch(':id')
  @Roles(EmployeeRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin đồ uống' })
  @ApiParam({ name: 'id', description: 'ID của đồ uống' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Đồ uống đã được cập nhật',
    type: Drink,
  })
  update(@Param('id') id: string, @Body() updateDrinkDto: UpdateDrinkDto) {
    return this.drinksService.update(+id, updateDrinkDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa đồ uống' })
  @ApiParam({ name: 'id', description: 'ID của đồ uống' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.drinksService.remove(+id);
  }
}
