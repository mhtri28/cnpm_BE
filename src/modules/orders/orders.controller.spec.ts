// Bỏ qua các valid module imports khi test để tránh lỗi
jest.mock('../../guard/auth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../../guard/role.guard', () => ({
  RoleGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilterOrdersDto } from './dto/filter/filter-orders.dto';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        tableId: 'table-1',
        orderItems: [
          {
            drinkId: 1,
            quantity: 2,
          },
        ],
      };

      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: null,
        tableId: 'table-1',
        status: OrderStatus.PENDING,
      };

      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(createOrderDto);

      expect(result).toBe(mockOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith(createOrderDto);
    });

    it('should throw BadRequestException when creating order with invalid tableId', async () => {
      const createOrderDto: CreateOrderDto = {
        tableId: 'invalid_table_id',
        orderItems: [{ drinkId: 1, quantity: 2 }],
      };

      // Mô phỏng dịch vụ ném ra lỗi BadRequestException khi tableId không hợp lệ
      mockOrdersService.create.mockRejectedValue(
        new BadRequestException('Table không hợp lệ'),
      );

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = {
        items: [
          {
            id: '1',
            employeeId: null,
            tableId: 'table-1',
            status: OrderStatus.PENDING,
          },
          {
            id: '2',
            employeeId: 2,
            tableId: 'table-2',
            status: OrderStatus.PAID,
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      // Sử dụng một đối tượng filterDto rỗng
      const filterDto = new FilterOrdersDto();
      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll(filterDto);

      expect(result).toBe(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: null,
        tableId: 'table-1',
        status: OrderStatus.PENDING,
      };

      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne('1');

      expect(result).toBe(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an order status', async () => {
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.PAID,
      };

      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: null,
        tableId: 'table-1',
        status: OrderStatus.PAID,
      };

      const mockCurrentUser = { id: 1, role: 'BARISTA' };

      mockOrdersService.update.mockResolvedValue(mockOrder);

      const result = await controller.update(
        '1',
        updateOrderDto,
        mockCurrentUser,
      );

      expect(result).toBe(mockOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith(
        '1',
        updateOrderDto,
        mockCurrentUser,
      );
    });

    it('should update an order status from PAID to PREPARING and set employeeId to currentUser.id', async () => {
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.PREPARING,
      };

      // Mock current authenticated barista
      const mockCurrentUser = { id: 1, role: 'BARISTA' };

      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: 1, // Should be set to currentUser.id
        tableId: 'table-1',
        status: OrderStatus.PREPARING,
      };

      mockOrdersService.update.mockResolvedValue(mockOrder);

      const result = await controller.update(
        '1',
        updateOrderDto,
        mockCurrentUser,
      );

      expect(result).toBe(mockOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith(
        '1',
        updateOrderDto,
        mockCurrentUser,
      );
    });
  });
});
