import { Test, TestingModule } from '@nestjs/testing';
import { DrinksService } from './drinks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Drink } from './entities/drink.entity';
import { Repository } from 'typeorm';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { NotFoundException } from '@nestjs/common';

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
});

type MockRepository = MockType<Repository<Drink>>;

describe('DrinksService', () => {
  let service: DrinksService;
  let repository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrinksService,
        {
          provide: getRepositoryToken(Drink),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<DrinksService>(DrinksService);
    repository = module.get<MockRepository>(getRepositoryToken(Drink));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a drink', async () => {
      // Arrange
      const createDrinkDto: CreateDrinkDto = {
        name: 'Cà phê sữa đá',
        price: 29000,
      };

      repository.create!.mockReturnValue(mockDrink);
      repository.save!.mockResolvedValue(mockDrink);

      // Act
      const result = await service.create(createDrinkDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createDrinkDto);
      expect(repository.save).toHaveBeenCalledWith(mockDrink);
      expect(result).toEqual(mockDrink);
    });
  });

  describe('findAll', () => {
    it('should return an array of drinks', async () => {
      // Arrange
      repository.find!.mockResolvedValue(mockDrinksList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockDrinksList);
    });
  });

  describe('findOne', () => {
    it('should return a drink when ID exists', async () => {
      // Arrange
      repository.findOne!.mockResolvedValue(mockDrink);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['recipes', 'orderItems'],
      });
      expect(result).toEqual(mockDrink);
    });

    it('should throw NotFoundException when drink does not exist', async () => {
      // Arrange
      repository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['recipes', 'orderItems'],
      });
    });
  });

  describe('update', () => {
    it('should update a drink when it exists', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
      };
      const updatedDrink = { ...mockDrink, price: 32000 };

      repository.findOne!.mockResolvedValue(mockDrink);
      repository.save!.mockResolvedValue(updatedDrink);

      // Act
      const result = await service.update(1, updateDrinkDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['recipes', 'orderItems'],
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedDrink);
    });

    it('should throw NotFoundException when trying to update a non-existent drink', async () => {
      // Arrange
      repository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { price: 32000 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a drink when it exists', async () => {
      // Arrange
      repository.softDelete!.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(1);

      // Assert
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when trying to remove a non-existent drink', async () => {
      // Arrange
      repository.softDelete!.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).toHaveBeenCalledWith(999);
    });
  });
});
