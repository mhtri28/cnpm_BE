import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DrinksService } from '../drinks/drinks.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Drink } from '../drinks/entities/drink.entity';

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      delete: jest.fn(),
    },
  }),
};

const mockOrderRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const mockOrderItemRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

// Tạo một đối tượng drink đầy đủ cho mock
const mockDrink: Partial<Drink> = {
  id: 1,
  name: 'Test Drink',
  price: 10,
  recipes: [],
  orderItems: [],
  soldCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
};

const mockDrinksService = () => ({
  findOne: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let drinksService: jest.Mocked<DrinksService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useFactory: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useFactory: mockOrderItemRepository,
        },
        {
          provide: DrinksService,
          useFactory: mockDrinksService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order)) as jest.Mocked<Repository<Order>>;
    drinksService = module.get<DrinksService>(DrinksService) as jest.Mocked<DrinksService>;
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = [{ id: '1', status: OrderStatus.PENDING }];
      orderRepository.find.mockResolvedValue(mockOrders as Order[]);

      const result = await service.findAll();
      expect(result).toEqual(mockOrders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        relations: [
          'orderItems',
          'employee',
          'table',
          'payment',
          'orderItems.drink',
        ],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockOrder = { id: '1', status: OrderStatus.PENDING };
      orderRepository.findOne.mockResolvedValue(mockOrder as Order);

      const result = await service.findOne('1');
      expect(result).toEqual(mockOrder);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: [
          'orderItems',
          'employee',
          'table',
          'payment',
          'orderItems.drink',
        ],
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new order with items', async () => {
      const mockOrder = { id: '1', status: OrderStatus.PENDING };
      const mockOrderItem = {
        id: '1',
        orderId: '1',
        drinkId: 1,
        quantity: 2,
        priceAtOrder: 10,
        subTotal: 20,
      };

      // Mock drink service to return a drink
      drinksService.findOne.mockResolvedValue(mockDrink as Drink);

      // Mock repositories
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        orderItems: [mockOrderItem],
      } as any);

      // Create order DTO
      const createOrderDto: CreateOrderDto = {
        employeeId: 1,
        orderItems: [{ drinkId: '1', quantity: 2 }],
      };

      const result = await service.create(createOrderDto);

      // Assertions
      expect(result).toEqual({ ...mockOrder, orderItems: [mockOrderItem] });
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(drinksService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw an exception if drink not found', async () => {
      // Mock to simulate a undefined drink (not found)
      drinksService.findOne.mockResolvedValue(undefined as any);

      const createOrderDto: CreateOrderDto = {
        employeeId: 1,
        orderItems: [{ drinkId: '1', quantity: 2 }],
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        tableId: 'table1',
      };

      // Mock findOne to return the order
      orderRepository.findOne.mockResolvedValue(mockOrder as Order);
      orderRepository.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PAID,
      } as Order);

      // Create update DTO
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.PAID,
      };

      // Call service method
      await service.update('1', updateOrderDto);

      // Assertions
      expect(orderRepository.save).toHaveBeenCalled();
      expect(orderRepository.findOne).toHaveBeenCalledTimes(2); // Once for initial find, once after update
    });
  });

  describe('remove', () => {
    it('should delete an order with PENDING status', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
      };

      // Mock findOne to return the order
      orderRepository.findOne.mockResolvedValue(mockOrder as Order);

      // Call service method
      await service.remove('1');

      // Assertions
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      const queryRunner = dataSource.createQueryRunner();
      expect(queryRunner.manager.delete).toHaveBeenCalledTimes(2); // Once for items, once for order
    });

    it('should throw BadRequestException if order status is not PENDING or CANCELED', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PAID,
      };

      // Mock findOne to return the order
      orderRepository.findOne.mockResolvedValue(mockOrder as Order);

      // Assertions
      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});
