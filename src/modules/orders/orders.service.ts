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
    // Kiểm tra xem bàn có tồn tại không
    const table = await this.tablesService.findOne(createOrderDto.tableId);
    if (!table) {
      throw new NotFoundException(
        `Không tìm thấy bàn với ID: ${createOrderDto.tableId}`,
      );
    }

    // Kiểm tra xem nhân viên có tồn tại không
    try {
      await this.employeesService.findById(createOrderDto.employeeId);
    } catch {
      throw new NotFoundException(
        `Không tìm thấy nhân viên với ID: ${createOrderDto.employeeId}`,
      );
    }

    // Bắt đầu transaction
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

      // Lưu các mục đơn hàng vào database
      await queryRunner.manager.save(orderItems);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về đơn hàng đã tạo kèm các mục
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

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: [
        'orderItems',
        'employee',
        'table',
        'payment',
        'orderItems.drink',
      ],
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
