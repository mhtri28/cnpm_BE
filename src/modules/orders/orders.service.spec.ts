import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DrinksService } from '../drinks/drinks.service';
import { TablesService } from '../tables/tables.service';
import { EmployeesService } from '../employees/employees.service';
import { EmployeeRole } from '../employees/entities/employee.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Drink } from '../drinks/entities/drink.entity';
import { Table } from '../tables/entities/table.entity';
import { Employee } from '../employees/entities/employee.entity';

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

// Tạo mock table
const mockTable1: Partial<Table> = {
  id: 'table-1',
  name: 'Bàn 1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  orders: [],
};

const mockTable2: Partial<Table> = {
  id: 'table-2',
  name: 'Bàn 2',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  orders: [],
};

// Tạo mock employee
const mockEmployee: Partial<Employee> = {
  id: 1,
  name: 'Nhân viên 1',
  phone: '0123456789',
  email: 'nhanvien1@example.com',
  role: EmployeeRole.BARISTA,
  password: 'hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  stockImports: [],
  orders: [],
};

const mockDrinksService = () => ({
  findOne: jest.fn(),
});

const mockTablesService = () => ({
  findOne: jest.fn(),
});

const mockEmployeesService = () => ({
  findById: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let drinksService: { findOne: jest.Mock };
  let tablesService: { findOne: jest.Mock };
  let employeesService: { findById: jest.Mock };
  let dataSource: { createQueryRunner: jest.Mock };

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
          provide: TablesService,
          useFactory: mockTablesService,
        },
        {
          provide: EmployeesService,
          useFactory: mockEmployeesService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    drinksService = module.get(DrinksService);
    tablesService = module.get(TablesService);
    employeesService = module.get(EmployeesService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = [{ id: '1', status: OrderStatus.PENDING }];
      (orderRepository.find as jest.Mock).mockResolvedValue(mockOrders as Order[]);

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
      (orderRepository.findOne as jest.Mock).mockResolvedValue(mockOrder as Order);

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
      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

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

      // Mock tìm bàn thành công
      tablesService.findOne.mockResolvedValue(mockTable1 as Table);

      // Mock tìm nhân viên thành công
      employeesService.findById.mockResolvedValue(mockEmployee as Employee);

      // Mock drink service to return a drink
      drinksService.findOne.mockResolvedValue(mockDrink as Drink);

      // Mock repositories
      (orderRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockOrder,
        orderItems: [mockOrderItem],
      } as any);

      // Create order DTO
      const createOrderDto: CreateOrderDto = {
        employeeId: 1,
        tableId: 'table-1',
        orderItems: [{ drinkId: '1', quantity: 2 }],
      };

      const result = await service.create(createOrderDto);

      // Assertions
      expect(result).toEqual({ ...mockOrder, orderItems: [mockOrderItem] });
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(drinksService.findOne).toHaveBeenCalledWith(1);
      expect(tablesService.findOne).toHaveBeenCalledWith('table-1');
      expect(employeesService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an exception if table not found', async () => {
      // Mock tìm bàn thất bại
      tablesService.findOne.mockResolvedValue(null);

      const createOrderDto: CreateOrderDto = {
        employeeId: 1,
        tableId: 'invalid-table',
        orderItems: [{ drinkId: '1', quantity: 2 }],
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tablesService.findOne).toHaveBeenCalledWith('invalid-table');
    });

    it('should throw an exception if employee not found', async () => {
      // Mock tìm bàn thành công
      tablesService.findOne.mockResolvedValue(mockTable1 as Table);

      // Mock tìm nhân viên thất bại
      employeesService.findById.mockRejectedValue(
        new NotFoundException(`Không tìm thấy nhân viên với ID: 999`),
      );

      const createOrderDto: CreateOrderDto = {
        employeeId: 999,
        tableId: 'table-1',
        orderItems: [{ drinkId: '1', quantity: 2 }],
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tablesService.findOne).toHaveBeenCalledWith('table-1');
      expect(employeesService.findById).toHaveBeenCalledWith(999);
    });

    it('should throw an exception if drink not found', async () => {
      // Mock tìm bàn thành công
      tablesService.findOne.mockResolvedValue(mockTable1 as Table);

      // Mock tìm nhân viên thành công
      employeesService.findById.mockResolvedValue(mockEmployee as Employee);

      // Mock to simulate a undefined drink (not found)
      drinksService.findOne.mockResolvedValue(undefined as any);

      const createOrderDto: CreateOrderDto = {
        employeeId: 1,
        tableId: 'table-1',
        orderItems: [{ drinkId: '1', quantity: 2 }],
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tablesService.findOne).toHaveBeenCalledWith('table-1');
      expect(employeesService.findById).toHaveBeenCalledWith(1);
      expect(drinksService.findOne).toHaveBeenCalledWith(1);
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
      (orderRepository.findOne as jest.Mock).mockResolvedValue(mockOrder as Order);
      (orderRepository.save as jest.Mock).mockResolvedValue({
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

    it('should update order tableId and check if table exists', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        tableId: 'table1',
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(mockOrder as Order);
      (orderRepository.save as jest.Mock).mockResolvedValue({
        ...mockOrder,
        tableId: 'table-2',
      } as Order);

      // Mock tìm bàn thành công
      tablesService.findOne.mockResolvedValue(mockTable2 as Table);

      // Create update DTO
      const updateOrderDto: UpdateOrderDto = {
        tableId: 'table-2',
      };

      // Call service method
      await service.update('1', updateOrderDto);

      // Assertions
      expect(tablesService.findOne).toHaveBeenCalledWith('table-2');
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if update tableId is invalid', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        tableId: 'table1',
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(mockOrder as Order);

      // Mock tìm bàn thất bại
      tablesService.findOne.mockResolvedValue(null);

      // Create update DTO
      const updateOrderDto: UpdateOrderDto = {
        tableId: 'invalid-table',
      };

      // Call service method and expect error
      await expect(service.update('1', updateOrderDto)).rejects.toThrow(
        NotFoundException,
      );

      // Assertions
      expect(tablesService.findOne).toHaveBeenCalledWith('invalid-table');
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an order with PENDING status', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(mockOrder as Order);

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
      (orderRepository.findOne as jest.Mock).mockResolvedValue(mockOrder as Order);

      // Assertions
      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});
