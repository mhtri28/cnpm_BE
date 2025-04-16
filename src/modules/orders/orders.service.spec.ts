import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
import { FilterOrdersDto } from './dto/filter/filter-orders.dto';

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

// Mở rộng mock repository để hỗ trợ queryBuilder
const mockOrderRepository = () => {
  const items = [{ id: '1', status: OrderStatus.PENDING }];
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(items),
    getCount: jest.fn().mockResolvedValue(items.length),

  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };
};

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
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Bàn 1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  orders: [],
};

const mockTable2: Partial<Table> = {
  id: '550e8400-e29b-41d4-a716-446655440001',
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
  let orderRepository: any;
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
      const mockItems = [{ id: '1', status: OrderStatus.PENDING }];

      // Thiết lập giá trị trả về cho mockQueryBuilder
      const queryBuilder = orderRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockItems);
      queryBuilder.getCount.mockResolvedValue(mockItems.length);

      // Tạo một đối tượng FilterOrdersDto rỗng
      const filterDto = new FilterOrdersDto();

      const result = await service.findAll(filterDto);

      // Kiểm tra kết quả phân trang
      expect(result.items).toEqual(mockItems);
      expect(result.total).toEqual(mockItems.length);
      expect(result.page).toEqual(1);
      expect(result.limit).toEqual(10);
      expect(result.totalPages).toEqual(1);

      // Kiểm tra queryBuilder được gọi
      expect(orderRepository.createQueryBuilder).toHaveBeenCalledWith('order');
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const mockOrder = { id: '1', status: OrderStatus.PENDING };
      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrder as Order,
      );

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
        tableId: '550e8400-e29b-41d4-a716-446655440000',
        orderItems: [{ drinkId: 1, quantity: 2 }],
      };

      const result = await service.create(createOrderDto);

      // Assertions
      expect(result).toEqual({ ...mockOrder, orderItems: [mockOrderItem] });
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(drinksService.findOne).toHaveBeenCalledWith(1);
      expect(tablesService.findOne).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(employeesService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an exception if table not found', async () => {
      // Mock tìm bàn thất bại
      tablesService.findOne.mockResolvedValue(null);

      const createOrderDto: CreateOrderDto = {
        employeeId: 1,
        tableId: 'invalid-table',
        orderItems: [{ drinkId: 1, quantity: 2 }],
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
        tableId: '550e8400-e29b-41d4-a716-446655440000',
        orderItems: [{ drinkId: 1, quantity: 2 }],
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tablesService.findOne).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
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
        tableId: '550e8400-e29b-41d4-a716-446655440000',
        orderItems: [{ drinkId: 1, quantity: 2 }],
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tablesService.findOne).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(employeesService.findById).toHaveBeenCalledWith(1);
      expect(drinksService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    /**
     * Only accept updating status.
     * other fields like employeeId, tableId are not allowed to be updated.
     */

    it('should update order status', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
      };

      // Mock findOne to return the order - first call includes relations
      (orderRepository.findOne as jest.Mock).mockResolvedValueOnce(
        mockOrder as Order,
      );

      // Mock findOne for the second call at the end which also includes relations
      (orderRepository.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockOrder,
        status: OrderStatus.CANCELED,
      } as Order);

      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.CANCELED,
      };

      // Call service method
      const result = await service.update('1', updateOrderDto);

      // Assertions
      // First call to findOne should include relations (from the findOne method)
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

      // Check that save was called with the updated order
      expect(orderRepository.save).toHaveBeenCalledWith({
        ...mockOrder,
        status: OrderStatus.CANCELED,
      });

      // Check the result matches what we expect
      expect(result).toEqual({ ...mockOrder, status: OrderStatus.CANCELED });
    });

    it('should throw NotFoundException if order not found', async () => {
      (orderRepository.findOne as jest.Mock).mockResolvedValue(null);

      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.CANCELED,
      };

      await expect(service.update('1', updateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw BadRequestException if status is not valid', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrder as Order,
      );

      const updateOrderDto: UpdateOrderDto = {
        status: 'invalid_status' as OrderStatus,
      };

      // Call service method
      await expect(service.update('1', updateOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException if order status is COMPLETED or CANCELED', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.COMPLETED,
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrder as Order,
      );

      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.CANCELED,
      };

      // Call service method
      await expect(service.update('1', updateOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if include other fields', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrder as Order,
      );

      const updateOrderDto: UpdateOrderDto = {
        employeeId: 1,
        tableId: '550e8400-e29b-41d4-a716-446655440000',
        status: OrderStatus.CANCELED,
      };

      // Call service method
      await expect(service.update('1', updateOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an order with PENDING status', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
      };

      // Mock findOne to return the order
      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrder as Order,
      );

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
      (orderRepository.findOne as jest.Mock).mockResolvedValue(
        mockOrder as Order,
      );

      // Assertions
      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });
  });
});
