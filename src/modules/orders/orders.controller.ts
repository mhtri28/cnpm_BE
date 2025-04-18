import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../../guard/auth.guard';
import { RoleGuard } from '../../guard/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { FilterOrdersDto, OrderSort } from './dto/filter/filter-orders.dto';
import { PaginationResult } from './dto/filter/pagination-result.interface';
import { CurrentUser } from '../../decorators/currentUser.decorator';

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
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn đặt, có thể lọc, sắp xếp và phân trang',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn đặt phân trang',
    type: PaginationResult,
  })
  @ApiQuery({
    name: 'tableName',
    required: false,
    description: 'Lọc theo tên bàn (tìm kiếm tương đối)',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Lọc theo trạng thái đơn hàng',
    enum: ['pending', 'paid', 'preparing', 'completed', 'canceled'],
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description:
      'Sắp xếp theo trường và hướng, phân tách bởi dấu phẩy. Ví dụ: createdAt_DESC,status_ASC',
    enum: OrderSort,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Số trang (bắt đầu từ 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng kết quả trên mỗi trang',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'withCanceled',
    required: false,
    description: 'Bao gồm đơn hàng đã hủy trong kết quả (mặc định: false)',
    type: Boolean,
    example: false,
  })
  @ApiBearerAuth()
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  findAll(
    @Query() filterDto: FilterOrdersDto,
  ): Promise<PaginationResult<Order>> {
    return this.ordersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy đơn đặt theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Đơn đặt đã được tìm thấy',
    type: Order,
  })
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @Roles(EmployeeRole.BARISTA)
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ordersService.update(id, updateOrderDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn đặt' })
  @ApiResponse({
    status: 200,
    description: 'Đơn đặt đã được xóa thành công',
  })
  @ApiBearerAuth()
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
