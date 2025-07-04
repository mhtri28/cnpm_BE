import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
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
import { FilterTableOrdersDto } from '../tables/dto/filter-table-orders.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    private readonly drinksService: DrinksService,
    @Inject(forwardRef(() => TablesService))
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

    // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra các đồ uống tồn tại và nguyên liệu đủ
      const ingredientUsage = new Map<number, number>(); // Map để theo dõi lượng nguyên liệu cần dùng

      for (const item of createOrderDto.orderItems) {
        const drink = await this.drinksService.findOne(item.drinkId);
        if (!drink) {
          throw new NotFoundException(
            `Không tìm thấy đồ uống với ID: ${item.drinkId}`,
          );
        }

        // Lấy các công thức của đồ uống
        const recipes = await this.recipeRepository.find({
          where: { drinkId: item.drinkId },
          relations: ['ingredient'],
        });

        if (recipes.length === 0) {
          throw new BadRequestException(
            `Đồ uống với ID: ${item.drinkId} chưa có công thức.`,
          );
        }

        // Tính toán lượng nguyên liệu cần cho mỗi đồ uống dựa vào số lượng
        recipes.forEach((recipe) => {
          const requiredAmount =
            parseFloat(recipe.quantity.toString()) * item.quantity;
          const ingredientId = recipe.ingredientId;

          // Cập nhật Map theo dõi lượng nguyên liệu cần dùng
          if (ingredientUsage.has(ingredientId)) {
            ingredientUsage.set(
              ingredientId,
              (ingredientUsage.get(ingredientId) || 0) + requiredAmount,
            );
          } else {
            ingredientUsage.set(ingredientId, requiredAmount);
          }
        });
      }

      // Kiểm tra xem có đủ nguyên liệu không
      const ingredientIds = Array.from(ingredientUsage.keys());
      const ingredients =
        await this.ingredientRepository.findByIds(ingredientIds);

      // Kiểm tra từng nguyên liệu
      for (const ingredient of ingredients) {
        const requiredAmount = ingredientUsage.get(ingredient.id) || 0;
        const availableAmount = parseFloat(
          ingredient.availableCount.toString(),
        );

        if (availableAmount < requiredAmount) {
          throw new BadRequestException(
            `Không đủ nguyên liệu ${ingredient.name}. Còn lại: ${availableAmount} ${ingredient.unit}, cần: ${requiredAmount} ${ingredient.unit}.`,
          );
        }
      }

      // Tạo đơn hàng mới
      const order = new Order();
      order.id = uuidv4();
      order.employeeId = null; // Bắt đầu với employeeId là null
      order.tableId = createOrderDto.tableId;
      order.status = createOrderDto.status || OrderStatus.PENDING;

      // Lưu đơn hàng vào database
      await queryRunner.manager.save(order);

      // Xử lý các mục đơn hàng
      const orderItems = await Promise.all(
        createOrderDto.orderItems.map(async (item) => {
          const drink = await this.drinksService.findOne(item.drinkId);

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

      // Cập nhật số lượng nguyên liệu còn lại
      for (const [ingredientId, usedAmount] of ingredientUsage.entries()) {
        const ingredient = ingredients.find((i) => i.id === ingredientId);
        if (ingredient) {
          const newAmount =
            parseFloat(ingredient.availableCount.toString()) - usedAmount;
          await queryRunner.manager.update(
            Ingredient,
            { id: ingredientId },
            { availableCount: newAmount },
          );
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về đơn hàng đã được tạo kèm các mối quan hệ
      return this.findOne(order.id);
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error.message || 'Lỗi cơ sở dữ liệu. Vui lòng thử lại sau.',
      );
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

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    currentUser: any,
  ): Promise<Order> {
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

    // Kiểm tra trình tự chuyển đổi trạng thái hợp lệ
    if (updateOrderDto.status) {
      switch (order.status) {
        case OrderStatus.PENDING:
          // Từ PENDING chỉ có thể chuyển sang PAID hoặc CANCELED
          if (
            updateOrderDto.status !== OrderStatus.PAID &&
            updateOrderDto.status !== OrderStatus.CANCELED
          ) {
            throw new BadRequestException(
              `Không thể chuyển từ trạng thái ${order.status} sang ${updateOrderDto.status}. Chỉ có thể chuyển sang ${OrderStatus.PAID} hoặc ${OrderStatus.CANCELED}.`,
            );
          }
          break;
        case OrderStatus.PAID:
          // Từ PAID chỉ có thể chuyển sang PREPARING hoặc CANCELED
          if (
            updateOrderDto.status !== OrderStatus.PREPARING &&
            updateOrderDto.status !== OrderStatus.CANCELED
          ) {
            throw new BadRequestException(
              `Không thể chuyển từ trạng thái ${order.status} sang ${updateOrderDto.status}. Chỉ có thể chuyển sang ${OrderStatus.PREPARING} hoặc ${OrderStatus.CANCELED}.`,
            );
          }
          break;
        case OrderStatus.PREPARING:
          // Từ PREPARING chỉ có thể chuyển sang COMPLETED hoặc CANCELED
          if (
            updateOrderDto.status !== OrderStatus.COMPLETED &&
            updateOrderDto.status !== OrderStatus.CANCELED
          ) {
            throw new BadRequestException(
              `Không thể chuyển từ trạng thái ${order.status} sang ${updateOrderDto.status}. Chỉ có thể chuyển sang ${OrderStatus.COMPLETED} hoặc ${OrderStatus.CANCELED}.`,
            );
          }
          break;
        default:
          break;
      }
    }

    // Special handling for barista accepting an order (status changing from PAID to PREPARING)
    if (
      order.status === OrderStatus.PAID &&
      updateOrderDto.status === OrderStatus.PREPARING
    ) {
      // Use the current authenticated user's ID (barista) for this order
      if (!currentUser || !currentUser.id) {
        throw new BadRequestException(
          'Không tìm thấy thông tin người dùng đang đăng nhập.',
        );
      }

      // Set the employeeId to the current barista's ID
      order.employeeId = currentUser.id;
      order.status = updateOrderDto.status;
    }
    // Case for only updating status (but not from PAID to PREPARING)
    else if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    // Reject updates with fields other than status
    if (updateOrderDto.tableId || updateOrderDto.orderItems) {
      throw new BadRequestException(
        'Không thể cập nhật các mục đơn hàng hoặc bàn.',
      );
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

  async findOrdersByTable(
    tableId: string,
    filterDto?: FilterTableOrdersDto,
  ): Promise<PaginationResult<Order>> {
    const {
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
      .leftJoinAndSelect('orderItems.drink', 'drink')
      .where('order.tableId = :tableId', { tableId });

    // Áp dụng các điều kiện lọc
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
}
