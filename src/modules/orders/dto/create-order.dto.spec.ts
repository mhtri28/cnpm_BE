import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateOrderDto, CreateOrderItemDto } from './create-order.dto';
import { OrderStatus } from '../entities/order.entity';

describe('CreateOrderDto', () => {
  let dto: CreateOrderDto;

  beforeEach(() => {
    dto = new CreateOrderDto();
    dto.employeeId = 1;
    dto.tableId = 'table-1';
    dto.orderItems = [
      { drinkId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
    ];
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

  it('should be invalid without employeeId', async () => {
    (dto.employeeId as any) = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('employeeId');
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
      employeeId: 1,
      tableId: 'table-1',
      status: OrderStatus.PENDING,
      orderItems: [
        { drinkId: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
      ],
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
    dto.drinkId = '550e8400-e29b-41d4-a716-446655440000';
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

  it('should be invalid with non-UUID drinkId', async () => {
    dto.drinkId = 'invalid-uuid';

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
});
