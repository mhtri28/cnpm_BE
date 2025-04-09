import { validate } from 'class-validator';
import { CreateDrinkDto } from './create-drink.dto';

describe('CreateDrinkDto', () => {
  it('should pass validation with valid data', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = 'Cà phê sữa đá';
    dto.price = 29000;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    // Arrange
    const dto = new CreateDrinkDto();
    dto.name = '';
    dto.price = 29000;

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
    dto.price = 29000;

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
    dto.price = -100;

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
    // @ts-expect-error Testing invalid input
    dto.price = 'không phải là số';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });
});
