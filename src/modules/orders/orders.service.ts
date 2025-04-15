import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DrinksService } from '../drinks/drinks.service';
import { TablesService } from '../tables/tables.service';
import { EmployeesService } from '../employees/employees.service';
import { FilterOrdersDto, OrderSort } from './dto/filter/filter-orders.dto';
import { PaginationResult } from './dto/filter/pagination-result.interface';

// Định nghĩa thứ tự ưu tiên cho các trạng thái đơn hàng
// const ORDER_STATUS_PRIORITY = {
//   [OrderStatus.PENDING]: 1,
//   [OrderStatus.PAID]: 2,
//   [OrderStatus.PREPARING]: 3,
//   [OrderStatus.COMPLETED]: 4,
//   [OrderStatus.CANCELED]: 5,
// };

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly drinksService: DrinksService,
    private readonly tablesService: TablesService,
    private readonly employeesService: EmployeesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Kiểm tra bàn có tồn tại không
    const table = await this.tablesService.findOne(createOrderDto.tableId);
    if (!table) {
      throw new NotFoundException(
        `Không tìm thấy bàn với ID: ${createOrderDto.tableId}`,
      );
    }

    // Kiểm tra nhân viên có tồn tại không
    const employee = await this.employeesService.findById(
      createOrderDto.employeeId,
    );
    if (!employee) {
      throw new NotFoundException(
        `Không tìm thấy nhân viên với ID: ${createOrderDto.employeeId}`,
      );
    }

    // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo đơn hàng mới
      const order = new Order();
      order.id = uuidv4();
      order.employeeId = createOrderDto.employeeId;
      order.tableId = createOrderDto.tableId;
      order.status = createOrderDto.status || OrderStatus.PENDING;

      // Lưu đơn hàng vào database
      await queryRunner.manager.save(order);

      // Xử lý các mục đơn hàng
      const orderItems = await Promise.all(
        createOrderDto.orderItems.map(async (item) => {
          const drink = await this.drinksService.findOne(item.drinkId);
          if (!drink) {
            throw new NotFoundException(
              `Không tìm thấy đồ uống với ID: ${item.drinkId}`,
            );
          }

          // Tạo mục đơn hàng
          const orderItem = new OrderItem();
          orderItem.id = uuidv4();
          orderItem.orderId = order.id;
          orderItem.drinkId = drink.id;
          orderItem.quantity = item.quantity;
          orderItem.priceAtOrder = drink.price;
          orderItem.subTotal = drink.price * item.quantity;

          return orderItem;
        }),
      );

      // Lưu các mục đơn hàng
      await queryRunner.manager.save(orderItems);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về đơn hàng đã được tạo kèm các mối quan hệ
      return this.findOne(order.id);
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }

  async findAll(filterDto?: FilterOrdersDto): Promise<PaginationResult<Order>> {
    const {
      tableName,
      status,
      sort,
      page = 1,
      limit = 10,
      withCanceled = false,
    } = filterDto || {};

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.employee', 'employee')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoinAndSelect('orderItems.drink', 'drink');

    // Áp dụng các điều kiện lọc
    if (tableName) {
      queryBuilder.andWhere(`table.name = :tableName`, {
        tableName: tableName,
      });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    } else if (!withCanceled) {
      // Nếu không có lọc trạng thái cụ thể và không yêu cầu đơn hàng đã hủy,
      // loại bỏ tất cả đơn hàng có trạng thái CANCELED
      queryBuilder.andWhere('order.status != :canceledStatus', {
        canceledStatus: OrderStatus.CANCELED,
      });
    }

    // Áp dụng sắp xếp
    const sortParams = this.parseSortString(sort);

    if (sortParams.length === 0) {
      // Mặc định, sắp xếp theo status priority và sau đó theo createdAt
      queryBuilder.addSelect(
        `CASE
        WHEN order.status = '${OrderStatus.PENDING}' THEN 1
        WHEN order.status = '${OrderStatus.PAID}' THEN 2
        WHEN order.status = '${OrderStatus.PREPARING}' THEN 3
        WHEN order.status = '${OrderStatus.COMPLETED}' THEN 4
        WHEN order.status = '${OrderStatus.CANCELED}' THEN 5
        ELSE 6 END`,
        'order_status_priority',
      );
      queryBuilder.orderBy('order_status_priority', 'ASC');
      queryBuilder.addOrderBy('order.createdAt', 'DESC');
    } else {
      let isFirstSort = true;

      for (const param of sortParams) {
        const { field, direction } = param;

        if (field === 'status') {
          // Nếu sắp xếp theo trạng thái, sử dụng status priority
          queryBuilder.addSelect(
            `CASE
            WHEN order.status = '${OrderStatus.PENDING}' THEN 1
            WHEN order.status = '${OrderStatus.PAID}' THEN 2
            WHEN order.status = '${OrderStatus.PREPARING}' THEN 3
            WHEN order.status = '${OrderStatus.COMPLETED}' THEN 4
            WHEN order.status = '${OrderStatus.CANCELED}' THEN 5
            ELSE 6 END`,
            'order_status_priority',
          );

          if (isFirstSort) {
            queryBuilder.orderBy('order_status_priority', direction);
            isFirstSort = false;
          } else {
            queryBuilder.addOrderBy('order_status_priority', direction);
          }
        } else {
          // Sắp xếp bình thường cho các trường khác
          if (isFirstSort) {
            queryBuilder.orderBy(`order.${field}`, direction);
            isFirstSort = false;
          } else {
            queryBuilder.addOrderBy(`order.${field}`, direction);
          }
        }
      }
    }

    // Áp dụng phân trang
    const skip = (page - 1) * limit;

    // Lấy tổng số kết quả
    const total = await queryBuilder.getCount();

    // Lấy kết quả phân trang
    const items = await queryBuilder.skip(skip).take(limit).getMany();

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    // Trả về kết quả phân trang
    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private parseSortString(
    sortString?: string,
  ): { field: string; direction: 'ASC' | 'DESC' }[] {
    if (!sortString) {
      return [];
    }

    return sortString.split(',').map((sort) => {
      const trimmedSort = sort.trim() as OrderSort;

      if (trimmedSort === OrderSort.CREATED_AT_ASC) {
        return { field: 'createdAt', direction: 'ASC' as const };
      } else if (trimmedSort === OrderSort.CREATED_AT_DESC) {
        return { field: 'createdAt', direction: 'DESC' as const };
      } else if (trimmedSort === OrderSort.UPDATED_AT_ASC) {
        return { field: 'updatedAt', direction: 'ASC' as const };
      } else if (trimmedSort === OrderSort.UPDATED_AT_DESC) {
        return { field: 'updatedAt', direction: 'DESC' as const };
      } else if (trimmedSort === OrderSort.STATUS_ASC) {
        return { field: 'status', direction: 'ASC' as const };
      } else if (trimmedSort === OrderSort.STATUS_DESC) {
        return { field: 'status', direction: 'DESC' as const };
      } else {
        // Mặc định sắp xếp theo trạng thái và sau đó theo thời gian tạo
        return { field: 'status', direction: 'ASC' as const };
      }
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'orderItems',
        'employee',
        'table',
        'payment',
        'orderItems.drink',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    // Prevent updates to completed or canceled orders
    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELED
    ) {
      throw new BadRequestException(
        'Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy.',
      );
    }

    // Validate status exists in enum
    if (
      updateOrderDto.status &&
      !Object.values(OrderStatus).includes(updateOrderDto.status)
    ) {
      throw new BadRequestException(
        `Trạng thái đơn hàng không hợp lệ: ${updateOrderDto.status}`,
      );
    }

    // Reject updates with fields other than status
    if (
      updateOrderDto.employeeId ||
      updateOrderDto.tableId ||
      updateOrderDto.orderItems
    ) {
      throw new BadRequestException(
        'Chỉ cho phép cập nhật trạng thái đơn hàng. Không thể cập nhật các mục đơn hàng, nhân viên hoặc bàn.',
      );
    }

    // Update and save the order
    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    await this.orderRepository.save(order);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);

    // Chỉ xóa đơn hàng khi nó ở trạng thái PENDING hoặc CANCELED
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELED
    ) {
      throw new BadRequestException(
        'Không thể xóa đơn hàng đã được thanh toán hoặc đang được xử lý',
      );
    }

    // Xóa đơn hàng và các mục đơn hàng liên quan
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Xóa các mục đơn hàng
      await queryRunner.manager.delete(OrderItem, { orderId: id });

      // Xóa đơn hàng
      await queryRunner.manager.delete(Order, { id });

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Giải phóng queryRunner
      await queryRunner.release();
    }
  }
}
