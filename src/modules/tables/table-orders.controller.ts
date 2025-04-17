import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { AuthGuard } from '../../guard/auth.guard';
import { RoleGuard } from '../../guard/role.guard';
import { Roles } from '../../decorators/role.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from '../orders/entities/order.entity';
import {
  FilterOrdersDto,
  OrderSort,
} from '../orders/dto/filter/filter-orders.dto';
import { PaginationResult } from '../orders/dto/filter/pagination-result.interface';
import { TablesService } from './tables.service';

@ApiTags('Đơn đặt theo bàn')
@Controller('tables/:tableId/orders')
@UseGuards(AuthGuard, RoleGuard)
export class TableOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly tablesService: TablesService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Lấy danh sách đơn đặt của một bàn cụ thể, có thể lọc, sắp xếp và phân trang',
  })
  @ApiParam({
    name: 'tableId',
    required: true,
    description: 'ID của bàn',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn đặt của bàn được phân trang',
    type: PaginationResult,
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
  async findOrdersByTable(
    @Param('tableId') tableId: string,
    @Query() filterDto: FilterOrdersDto,
  ): Promise<PaginationResult<Order>> {
    // Kiểm tra xem bàn có tồn tại không
    await this.tablesService.findOne(tableId);

    // Gọi service để lấy đơn hàng theo bàn
    return this.ordersService.findOrdersByTable(tableId, filterDto);
  }
}
