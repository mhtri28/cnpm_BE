import { Test, TestingModule } from '@nestjs/testing';
import { DrinksController } from './drinks.controller';
import { DrinksService } from './drinks.service';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { Drink } from './entities/drink.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Mock các guards
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

// Tạo interface Partial để có thể ghi đè kiểu dữ liệu
type MockDrink = Omit<Drink, 'deletedAt'> & {
  deletedAt: Date | null;
};

const mockDrink = {
  id: 1,
  name: 'Cà phê sữa đá',
  price: 29000,
  soldCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  recipes: [],
  orderItems: [],
} as unknown as Drink;

const mockDrinksList = [
  mockDrink,
  {
    id: 2,
    name: 'Trà đào cam sả',
    price: 35000,
    soldCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    recipes: [],
    orderItems: [],
  } as unknown as Drink,
];

// Mock các services
const mockDrinksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getRecipeByDrinkId: jest.fn(),
  findAllDeleted: jest.fn(),
  restore: jest.fn(),
};

describe('DrinksController', () => {
  let controller: DrinksController;
  let service: DrinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinksController],
      providers: [
        {
          provide: DrinksService,
          useValue: mockDrinksService,
        },
      ],
    }).compile();

    controller = module.get<DrinksController>(DrinksController);
    service = module.get<DrinksService>(DrinksService);
  });

  // Reset mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new drink', async () => {
      // Arrange
      const createDrinkDto: CreateDrinkDto = {
        name: 'Cà phê sữa đá',
        image_url: 'https://example.com/images/drink.jpg',
        price: 29000,
        recipe: [
          { id: 1, quantity: 15 },
          { id: 2, quantity: 30 },
        ],
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(mockDrink);

      // Act
      const result = await controller.create(createDrinkDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDrinkDto);
      expect(result).toBe(mockDrink);
    });

    // Thay vì test các guard, chúng ta kiểm tra rằng controller được đúng annotations
    it('should have proper decorators for create method', () => {
      // Lấy metadata của controller
      const metadata = Reflect.getMetadata('__guards__', controller.create);
      // Kiểm tra rằng guards được áp dụng đúng cách
      expect(metadata).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of drinks', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockDrinksList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(mockDrinksList);
    });
  });

  describe('findOne', () => {
    it('should return a single drink', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockDrink);

      // Act
      const result = await controller.findOne('1');

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockDrink);
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a drink', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
        recipe: [
          { id: 1, quantity: 20 },
          { id: 3, quantity: 25 },
        ],
      };
      const updatedDrink = { ...mockDrink, price: 32000 } as Drink;

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedDrink);

      // Act
      const result = await controller.update('1', updateDrinkDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateDrinkDto);
      expect(result).toBe(updatedDrink);
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
      };

      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.update('999', updateDrinkDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(999, updateDrinkDto);
    });

    // Thay vì test các guard, chúng ta kiểm tra rằng controller được đúng annotations
    it('should have proper decorators for update method', () => {
      // Lấy metadata của controller
      const metadata = Reflect.getMetadata('__guards__', controller.update);
      // Kiểm tra rằng guards được áp dụng đúng cách
      expect(metadata).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a drink', async () => {
      // Arrange
      jest.spyOn(service, 'remove').mockResolvedValueOnce(undefined);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });

    // Thay vì test các guard, chúng ta kiểm tra rằng controller được đúng annotations
    it('should have proper decorators for remove method', () => {
      // Lấy metadata của controller
      const metadata = Reflect.getMetadata('__guards__', controller.remove);
      // Kiểm tra rằng guards được áp dụng đúng cách
      expect(metadata).toBeDefined();
    });
  });

  describe('getRecipeByDrinkId', () => {
    it('should return recipes of a drink', async () => {
      // Arrange
      const drinkId = '1';
      const recipes = [
        {
          id: 1,
          drinkId: 1,
          ingredientId: 1,
          quantity: 20,
          drink: undefined,
          ingredient: undefined,
        },
        {
          id: 2,
          drinkId: 1,
          ingredientId: 2,
          quantity: 30,
          drink: undefined,
          ingredient: undefined,
        },
      ];

      jest.spyOn(service, 'getRecipeByDrinkId').mockResolvedValueOnce(recipes);

      // Act
      const result = await controller.getRecipes(drinkId);

      // Assert
      expect(service.getRecipeByDrinkId).toHaveBeenCalledWith(1);
      expect(result).toBe(recipes);
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      jest
        .spyOn(service, 'getRecipeByDrinkId')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.getRecipes('999')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.getRecipeByDrinkId).toHaveBeenCalledWith(999);
    });
  });

  describe('findAllDeleted', () => {
    it('should return a list of soft deleted drinks', async () => {
      // Arrange
      const deletedDrinks = [
        {
          id: 3,
          name: 'Cafe Đen Đá',
          status: 'deleted',
          deletedAt: new Date(),
          // ...các thuộc tính khác
        },
        {
          id: 4,
          name: 'Trà Sữa Trân Châu',
          status: 'deleted',
          deletedAt: new Date(),
          // ...các thuộc tính khác
        },
      ] as unknown as Drink[];

      jest
        .spyOn(service, 'findAllDeleted')
        .mockResolvedValueOnce(deletedDrinks);

      // Act
      const result = await controller.findAllDeleted();

      // Assert
      expect(service.findAllDeleted).toHaveBeenCalled();
      expect(result).toBe(deletedDrinks);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted drink', async () => {
      // Arrange
      const drinkId = '1';
      const restoredDrink = {
        id: 1,
        name: 'Cà phê sữa đá',
        // ...các thuộc tính khác
        deletedAt: null,
      } as unknown as Drink;

      jest.spyOn(service, 'restore').mockResolvedValueOnce(restoredDrink);

      // Act
      const result = await controller.restore(drinkId);

      // Assert
      expect(service.restore).toHaveBeenCalledWith(1);
      expect(result).toBe(restoredDrink);
    });

    it('should throw NotFoundException if drink not found', async () => {
      // Arrange
      const drinkId = '999';

      jest
        .spyOn(service, 'restore')
        .mockRejectedValueOnce(
          new NotFoundException(`Không tìm thấy đồ uống với id ${drinkId}`),
        );

      // Act & Assert
      await expect(controller.restore(drinkId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.restore).toHaveBeenCalledWith(999);
    });

    it('should throw ConflictException if drink is not deleted', async () => {
      // Arrange
      const drinkId = '1';

      jest
        .spyOn(service, 'restore')
        .mockRejectedValueOnce(
          new ConflictException(`Đồ uống với id ${drinkId} chưa bị xóa`),
        );

      // Act & Assert
      await expect(controller.restore(drinkId)).rejects.toThrow(
        ConflictException,
      );
      expect(service.restore).toHaveBeenCalledWith(1);
    });

    // Thay vì test các guard, chúng ta kiểm tra rằng controller được đúng annotations
    it('should have proper decorators for restore method', () => {
      // Lấy metadata của controller
      const metadata = Reflect.getMetadata('__guards__', controller.restore);
      // Kiểm tra rằng guards được áp dụng đúng cách
      expect(metadata).toBeDefined();
    });
  });
});
