import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../../guard/auth.guard';
import { RoleGuard } from '../../guard/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order } from './entities/order.entity';

@ApiTags('Đơn đặt')
@Controller('orders')
@UseGuards(AuthGuard, RoleGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn đặt' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Đơn đặt đã được tạo thành công',
    type: Order,
  })
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả đơn đặt' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả đơn đặt',
    type: [Order],
  })
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy đơn đặt theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Đơn đặt đã được tìm thấy',
    type: Order,
  })
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đơn đặt' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Đơn đặt đã được cập nhật',
    type: Order,
  })
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
