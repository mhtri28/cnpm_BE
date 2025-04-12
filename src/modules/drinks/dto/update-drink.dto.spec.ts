import { validate } from 'class-validator';
import { UpdateDrinkDto } from './update-drink.dto';
import { plainToInstance } from 'class-transformer';

describe('UpdateDrinkDto', () => {
  // Helper function to properly transform and validate objects
  async function validateDto(dto: Record<string, any>) {
    const transformedDto = plainToInstance(UpdateDrinkDto, dto);
    return validate(transformedDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validationError: { target: false },
    });
  }

  it('should pass validation with valid data', async () => {
    // Arrange
    const dto = {
      name: 'Cà phê sữa đá',
      image_url: 'https://example.com/images/drink.jpg',
      price: 29000,
      recipe: [
        { id: 1, quantity: 20 },
        { id: 3, quantity: 25 },
      ],
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should pass validation with optional fields omitted', async () => {
    // Arrange
    const dto = {};

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is not a string', async () => {
    // Arrange
    const dto = {
      name: 12345,
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when image_url is not a string', async () => {
    // Arrange
    const dto = {
      image_url: 12345,
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('image_url');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when price is not a number', async () => {
    // Arrange
    const dto = {
      price: 'not-a-number',
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail validation when recipe is not an array', async () => {
    // Arrange
    const dto = {
      recipe: 'not-an-array',
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
    expect(errors[0].constraints).toHaveProperty('isArray');
  });

  it('should fail validation when recipe is an empty array', async () => {
    // Arrange
    const dto = {
      recipe: [],
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
    expect(errors[0].constraints).toHaveProperty('arrayMinSize');
  });

  it('should fail validation when recipe item id is not a number', async () => {
    // Arrange
    const dto = {
      recipe: [
        { id: 'not-a-number', quantity: 20 },
        { id: 3, quantity: 25 },
      ],
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
  });

  it('should fail validation when recipe item quantity is not a number', async () => {
    // Arrange
    const dto = {
      recipe: [
        { id: 1, quantity: 'not-a-number' },
        { id: 3, quantity: 25 },
      ],
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
  });

  it('should fail validation when recipe item quantity is less than 1', async () => {
    // Arrange
    const dto = {
      recipe: [
        { id: 1, quantity: 0 }, // Invalid quantity
        { id: 3, quantity: 25 },
      ],
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
  });

  it('should fail validation when recipe item id is not provided', async () => {
    // Arrange
    const dto = {
      recipe: [
        { quantity: 20 }, // Missing id
        { id: 3, quantity: 25 },
      ],
    };

    // Act
    const errors = await validateDto(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
  });
});
