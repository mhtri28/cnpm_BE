import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateOrderDto, CreateOrderItemDto } from './create-order.dto';
import { OrderStatus } from '../entities/order.entity';

describe('CreateOrderDto', () => {
  let dto: CreateOrderDto;

  beforeEach(() => {
    dto = new CreateOrderDto();
    dto.tableId = '550e8400-e29b-41d4-a716-446655440000';
    dto.orderItems = [{ drinkId: 1, quantity: 2 }];
  });

  it('should be valid with all required fields', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with optional fields', async () => {
    dto.status = OrderStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid without tableId', async () => {
    (dto.tableId as any) = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tableId');
  });

  it('should be invalid with empty order items', async () => {
    dto.orderItems = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('orderItems');
  });

  it('should be invalid with invalid status', async () => {
    dto.status = 'invalid_status' as OrderStatus;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should transform plain objects', () => {
    const plainObject = {
      tableId: '550e8400-e29b-41d4-a716-446655440000',
      status: OrderStatus.PENDING,
      orderItems: [{ drinkId: 1, quantity: 2 }],
    };

    const dtoInstance = plainToInstance(CreateOrderDto, plainObject);
    expect(dtoInstance).toBeInstanceOf(CreateOrderDto);
    expect(dtoInstance.orderItems[0]).toBeInstanceOf(CreateOrderItemDto);
  });
});

describe('CreateOrderItemDto', () => {
  let dto: CreateOrderItemDto;

  beforeEach(() => {
    dto = new CreateOrderItemDto();
    dto.drinkId = 1;
    dto.quantity = 2;
  });

  it('should be valid with all required fields', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid without drinkId', async () => {
    (dto.drinkId as any) = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('drinkId');
  });

  it('should be invalid with non-numeric drinkId', async () => {
    (dto.drinkId as any) = 'invalid_id';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('drinkId');
  });

  it('should be invalid without quantity', async () => {
    (dto.quantity as any) = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
  });

  it('should be invalid with non-numeric quantity', async () => {
    (dto.quantity as any) = 'invalid_quantity';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
  });

  it('should be invalid with negative quantity', async () => {
    dto.quantity = -1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('quantity');
  });
});
