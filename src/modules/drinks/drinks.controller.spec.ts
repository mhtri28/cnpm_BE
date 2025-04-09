import { Test, TestingModule } from '@nestjs/testing';
import { DrinksController } from './drinks.controller';
import { DrinksService } from './drinks.service';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { Drink } from './entities/drink.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

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

describe('DrinksController', () => {
  let controller: DrinksController;
  let service: DrinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinksController],
      providers: [
        {
          provide: DrinksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DrinksController>(DrinksController);
    service = module.get<DrinksService>(DrinksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new drink', async () => {
      // Arrange
      const createDrinkDto: CreateDrinkDto = {
        name: 'Cà phê sữa đá',
        price: 29000,
      };

      const createSpy = jest.spyOn(service, 'create').mockResolvedValueOnce(mockDrink);

      // Act
      const result = await controller.create(createDrinkDto);

      // Assert
      expect(createSpy).toHaveBeenCalledWith(createDrinkDto);
      expect(result).toBe(mockDrink);
    });
  });

  describe('findAll', () => {
    it('should return an array of drinks', async () => {
      // Arrange
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockDrinksList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(findAllSpy).toHaveBeenCalled();
      expect(result).toBe(mockDrinksList);
    });
  });

  describe('findOne', () => {
    it('should return a single drink', async () => {
      // Arrange
      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockDrink);

      // Act
      const result = await controller.findOne('1');

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(1);
      expect(result).toBe(mockDrink);
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      const findOneSpy = jest.spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(findOneSpy).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a drink', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
      };
      const updatedDrink = { ...mockDrink, price: 32000 } as Drink;

      const updateSpy = jest.spyOn(service, 'update')
        .mockResolvedValueOnce(updatedDrink);

      // Act
      const result = await controller.update('1', updateDrinkDto);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(1, updateDrinkDto);
      expect(result).toBe(updatedDrink);
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      const updateDrinkDto: UpdateDrinkDto = {
        price: 32000,
      };

      const updateSpy = jest.spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.update('999', updateDrinkDto)).rejects.toThrow(NotFoundException);
      expect(updateSpy).toHaveBeenCalledWith(999, updateDrinkDto);
    });
  });

  describe('remove', () => {
    it('should remove a drink', async () => {
      // Arrange
      const removeSpy = jest.spyOn(service, 'remove').mockResolvedValueOnce(undefined);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(removeSpy).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw an exception if drink not found', async () => {
      // Arrange
      const removeSpy = jest.spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(removeSpy).toHaveBeenCalledWith(999);
    });
  });
});
