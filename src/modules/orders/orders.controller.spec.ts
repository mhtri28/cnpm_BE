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
        employeeId: 1,
        tableId: 'table-1',
        orderItems: [
          {
            drinkId: '1',
            quantity: 2,
          },
        ],
      };

      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: 1,
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
        employeeId: 1,
        tableId: 'invalid_table_id',
        orderItems: [{ drinkId: '1', quantity: 2 }],
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
      const mockOrders: Partial<Order>[] = [
        {
          id: '1',
          employeeId: 1,
          tableId: 'table-1',
          status: OrderStatus.PENDING,
        },
        {
          id: '2',
          employeeId: 2,
          tableId: 'table-2',
          status: OrderStatus.PAID,
        },
      ];

      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll();

      expect(result).toBe(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: 1,
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
    it('should update an order', async () => {
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.PAID,
      };

      const mockOrder: Partial<Order> = {
        id: '1',
        employeeId: 1,
        tableId: 'table-1',
        status: OrderStatus.PAID,
      };

      mockOrdersService.update.mockResolvedValue(mockOrder);

      const result = await controller.update('1', updateOrderDto);

      expect(result).toBe(mockOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith('1', updateOrderDto);
    });
  });
});
