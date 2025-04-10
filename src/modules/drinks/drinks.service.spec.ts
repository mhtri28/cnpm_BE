import { Test, TestingModule } from '@nestjs/testing';
import { DrinksService } from './drinks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drink } from './entities/drink.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { NotFoundException } from '@nestjs/common';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

const mockDrink = {
  id: 1,
  name: 'Cà phê sữa đá',
  price: 29000,
  soldCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  recipes: [],
  orderItems: [],
};

const mockRecipes = [
  {
    id: 1,
    drinkId: 1,
    ingredientId: 1,
    quantity: 15,
  },
  {
    id: 2,
    drinkId: 1,
    ingredientId: 2,
    quantity: 30,
  },
];

const mockIngredients = [
  {
    id: 1,
    name: 'Cà phê',
    unit: 'g',
    availableCount: 1000,
  },
  {
    id: 2,
    name: 'Sữa đặc',
    unit: 'ml',
    availableCount: 2000,
  },
  {
    id: 3,
    name: 'Đường',
    unit: 'g',
    availableCount: 3000,
  },
];

const mockDrinkWithRecipes = {
  ...mockDrink,
  recipes: mockRecipes,
};

const mockDrinksList = [
  mockDrink,
  {
    id: 2,
    name: 'Trà đào cam sả',
    price: 35000,
    soldCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes: [],
    orderItems: [],
  },
];

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

// Tạo một repository mock phù hợp với TypeORM
const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
  })),
});

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    })),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

type MockRepository = MockType<Repository<Drink>>;

describe('DrinksService', () => {
  let service: DrinksService;
  let drinkRepository: MockRepository;
  let recipeRepository: MockRepository;
  let ingredientRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrinksService,
        {
          provide: getRepositoryToken(Drink),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(Recipe),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(Ingredient),
          useFactory: createMockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DrinksService>(DrinksService);
    drinkRepository = module.get<MockRepository>(getRepositoryToken(Drink));
    recipeRepository = module.get<MockRepository>(getRepositoryToken(Recipe));
    ingredientRepository = module.get<MockRepository>(
      getRepositoryToken(Ingredient),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a drink with recipes', async () => {
      // Arrange
      const createDrinkDto: CreateDrinkDto = {
        name: 'Cà phê sữa đá',
        price: 29000,
        recipe: [
          { id: 1, quantity: 15 },
          { id: 2, quantity: 30 },
        ],
      };

      // Mock repository trả về null khi tìm kiếm theo tên để đảm bảo tên đồ uống không bị trùng
      drinkRepository.findOne!.mockImplementation((options: any) => {
        if (
          options &&
          'where' in options &&
          options.where !== null &&
          typeof options.where === 'object'
        ) {
          if ('name' in options.where) {
            // Trả về null khi kiểm tra trùng tên - đồ uống chưa tồn tại
            return Promise.resolve(null);
          } else if ('id' in options.where) {
            // Trả về đồ uống với công thức khi tìm theo ID
            return Promise.resolve(mockDrinkWithRecipes);
          }
        }
        return Promise.resolve(null);
      });

      drinkRepository.create!.mockReturnValue(mockDrink);
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockDrink);
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockRecipes);

      ingredientRepository.findOne!.mockImplementation((options) => {
        if (
          options &&
          options.where &&
          typeof options.where === 'object' &&
          'id' in options.where
        ) {
          const id = options.where.id as number;
          return Promise.resolve(
            mockIngredients.find((ingredient) => ingredient.id === id) || null,
          );
        }
        return Promise.resolve(null);
      });

      // Act
      const result = await service.create(createDrinkDto);

      // Assert
      expect(drinkRepository.create).toHaveBeenCalledWith({
        name: 'Cà phê sữa đá',
        price: 29000,
      });
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockDrinkWithRecipes);
    });

    it('should throw NotFoundException when ingredient does not exist', async () => {
      // Arrange
      const createDrinkDto: CreateDrinkDto = {
        name: 'Cà phê sữa đá',
        price: 29000,
        recipe: [
          { id: 999, quantity: 15 }, // ID không tồn tại
        ],
      };

      drinkRepository.create!.mockReturnValue(mockDrink);
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockDrink);
      ingredientRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDrinkDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of drinks', async () => {
      // Arrange
      drinkRepository.find!.mockResolvedValue(mockDrinksList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(drinkRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockDrinksList);
    });
  });

  describe('findOne', () => {
    it('should return a drink when ID exists', async () => {
      // Arrange
      drinkRepository.findOne!.mockResolvedValue(mockDrink);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(drinkRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['recipes', 'recipes.ingredient', 'orderItems'],
      });
      expect(result).toEqual(mockDrink);
    });

    it('should throw NotFoundException when drink does not exist', async () => {
      // Arrange
      drinkRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(drinkRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['recipes', 'recipes.ingredient', 'orderItems'],
      });
    });
  });

  describe('update', () => {
    it('should update a drink with recipes when it exists', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
        recipe: [
          { id: 1, quantity: 20 },
          { id: 3, quantity: 25 },
        ],
      };
      const updatedDrink = { ...mockDrink, price: 32000 };

      drinkRepository.findOne!.mockResolvedValue(mockDrink);
      mockQueryRunner.manager.save.mockResolvedValueOnce(updatedDrink);

      ingredientRepository.findOne!.mockImplementation((options) => {
        if (
          options &&
          options.where &&
          typeof options.where === 'object' &&
          'id' in options.where
        ) {
          const id = options.where.id as number;
          return Promise.resolve(
            mockIngredients.find((ingredient) => ingredient.id === id) || null,
          );
        }
        return Promise.resolve(null);
      });

      recipeRepository.create!.mockImplementation((data) => data);

      // Mocking the final result
      drinkRepository
        .findOne!.mockImplementationOnce(() => Promise.resolve(mockDrink))
        .mockImplementationOnce(() => Promise.resolve(updatedDrink));

      // Act
      const result = await service.update(1, updateDrinkDto);

      // Assert
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(updatedDrink);
    });

    it('should throw NotFoundException when trying to update a non-existent drink', async () => {
      // Arrange
      drinkRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { price: 32000 })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException when ingredient does not exist', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
        recipe: [
          { id: 999, quantity: 20 }, // ID không tồn tại
        ],
      };

      drinkRepository.findOne!.mockResolvedValue(mockDrink);
      mockQueryRunner.manager.save.mockResolvedValueOnce(mockDrink);
      ingredientRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDrinkDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a drink when it exists', async () => {
      // Arrange
      drinkRepository.softDelete!.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(1);

      // Assert
      expect(drinkRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when trying to remove a non-existent drink', async () => {
      // Arrange
      drinkRepository.softDelete!.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(drinkRepository.softDelete).toHaveBeenCalledWith(999);
    });
  });
});
