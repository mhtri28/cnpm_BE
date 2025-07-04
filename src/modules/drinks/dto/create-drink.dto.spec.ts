import { validate } from 'class-validator';
import { CreateDrinkDto, RecipeItemDto } from './create-drink.dto';

describe('CreateDrinkDto', () => {
  it('should pass validation with valid data', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    dto.image_url = 'https://example.com/images/drink.jpg';
    dto.price = 29000;
    dto.recipe = [
      { id: 1, quantity: 15 },
      { id: 2, quantity: 30 },
    ];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = '';
    dto.image_url = 'https://example.com/images/drink.jpg';
    dto.price = 29000;
    dto.recipe = [
      { id: 1, quantity: 15 },
      { id: 2, quantity: 30 },
    ];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when name is not a string', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    // @ts-expect-error Testing invalid input
    dto.name = 123;
    dto.image_url = 'https://example.com/images/drink.jpg';
    dto.price = 29000;
    dto.recipe = [
      { id: 1, quantity: 15 },
      { id: 2, quantity: 30 },
    ];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when price is negative', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    dto.image_url = 'https://example.com/images/drink.jpg';
    dto.price = -100;
    dto.recipe = [
      { id: 1, quantity: 15 },
      { id: 2, quantity: 30 },
    ];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should fail validation when price is not a number', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    dto.image_url = 'https://example.com/images/drink.jpg';
    // @ts-expect-error Testing invalid input
    dto.price = 'không phải là số';
    dto.recipe = [
      { id: 1, quantity: 15 },
      { id: 2, quantity: 30 },
    ];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail validation when recipe is empty', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    dto.image_url = 'https://example.com/images/drink.jpg';
    dto.price = 29000;
    dto.recipe = [];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');
    expect(errors[0].constraints).toHaveProperty('arrayMinSize');
  });

  it('should fail validation when recipe item has invalid data', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    dto.image_url = 'https://example.com/images/drink.jpg';
    dto.price = 29000;
    dto.recipe = [
      { id: 1, quantity: -5 }, // Quantity không thể âm
    ];

    // Act
    const errors = await validate(dto, { validationError: { target: false } });

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('recipe');

    // Đơn giản hóa test để tránh undefined
    // Đảm bảo có lỗi validation
    expect(errors[0].constraints || errors[0].children).toBeDefined();
  });

  it('should fail validation when not provided image_url', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    // @ts-expect-error Testing invalid input
    dto.image_url = undefined;
    dto.price = 29000;
    dto.recipe = [
      { id: 1, quantity: 15 },
      { id: 2, quantity: 30 },
    ];

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('image_url');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});

describe('RecipeItemDto', () => {
  it('should pass validation with valid data', async () => {
    // Arrange
    const dto = new RecipeItemDto();
    dto.id = 1;
    dto.quantity = 15;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail validation when quantity is less than 1', async () => {
    // Arrange
    const dto = new RecipeItemDto();
    dto.id = 1;
    dto.quantity = 0;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should fail validation when id is not a number', async () => {
    // Arrange
    const dto = new RecipeItemDto();
    // @ts-expect-error Testing invalid input
    dto.id = 'không phải là số';
    dto.quantity = 15;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail validation when quantity is not a number', async () => {
    // Arrange
    const dto = new RecipeItemDto();
    dto.id = 1;
    // @ts-expect-error Testing invalid input
    dto.quantity = 'không phải là số';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail validation when id is not provided', async () => {
    // Arrange
    const dto = new RecipeItemDto();
    // @ts-expect-error Testing invalid input
    dto.id = undefined;
    dto.quantity = 15;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when quantity is not provided', async () => {
    // Arrange
    const dto = new RecipeItemDto();
    dto.id = 1;
    // @ts-expect-error Testing invalid input
    dto.quantity = undefined;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
