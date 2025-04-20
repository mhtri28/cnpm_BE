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
  BadRequestException,
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
import { Order, OrderStatus } from './entities/order.entity';
import { FilterOrdersDto, OrderSort } from './dto/filter/filter-orders.dto';
import { PaginationResult } from './dto/filter/pagination-result.interface';
import { CurrentUser } from '../../decorators/currentUser.decorator';

@ApiTags('Đơn đặt')
@Controller('orders')
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
  @UseGuards(AuthGuard, RoleGuard)
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
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/customer')
  @ApiOperation({
    summary: 'Cập nhật đơn đặt (cho khách hàng)',
    description:
      'Endpoint này cho phép khách hàng cập nhật đơn hàng khi ở trạng thái PENDING sang CANCELED (hủy đơn).',
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Đơn đặt đã được cập nhật thành công',
    type: Order,
  })
  async updateByCustomer(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.ordersService.findOne(id);

    // Chỉ cho phép khách hàng cập nhật đơn từ PENDING -> hoặc CANCELED
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Không thể cập nhật đơn hàng. Đơn hàng không ở trạng thái chờ thanh toán.`,
      );
    }

    // Chỉ cho phép cập nhật sang trạng thái PAID hoặc CANCELED
    if (updateOrderDto.status !== OrderStatus.CANCELED) {
      throw new BadRequestException(
        `Trạng thái không hợp lệ. Bạn chỉ có thể cập nhật đơn hàng sang trạng thái CANCELED (hủy đơn).`,
      );
    }

    return this.ordersService.update(id, updateOrderDto, null);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật đơn đặt (cho nhân viên)',
    description:
      'Endpoint này yêu cầu xác thực và quyền hạn, dành cho nhân viên cập nhật đơn hàng sau khi đã thanh toán.',
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Đơn đặt đã được cập nhật',
    type: Order,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
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
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(EmployeeRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
