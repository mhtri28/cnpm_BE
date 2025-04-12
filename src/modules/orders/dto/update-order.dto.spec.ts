import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderDto } from './update-order.dto';
import { OrderStatus } from '../entities/order.entity';

describe('UpdateOrderDto', () => {
  let dto: UpdateOrderDto;

  beforeEach(() => {
    dto = new UpdateOrderDto();
  });

  /**
   * Order can be updated with only status
   */

  it('should be valid with only status', async () => {
    dto.status = OrderStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with empty status', async () => {
    (dto.status as any) = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should be invalid with invalid status', async () => {
    dto.status = 'invalid_status' as OrderStatus;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should transform plain objects', () => {
    const plain = {
      status: OrderStatus.PENDING,
    };

    const transformed = plainToInstance(UpdateOrderDto, plain);
    expect(transformed).toBeInstanceOf(UpdateOrderDto);
    expect(transformed.status).toBe(OrderStatus.PENDING);
  });

  it('should transform plain objects with invalid status', () => {
    const plain = {
      status: 'invalid_status',
    };

    const transformed = plainToInstance(UpdateOrderDto, plain);
    expect(transformed).toBeInstanceOf(UpdateOrderDto);
    expect(transformed.status).toBe('invalid_status');
  });

  it('should be invalid with other fields', async () => {
    dto.status = OrderStatus.PENDING;
    // These fields should not be provided in this DTO
    // employeeId and tableId are not allowed in UpdateOrderDto
    // but we are providing them to check if the validation works
    dto.employeeId = 1;
    dto.tableId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    // Check if the errors are for employeeId and tableId, no need to order it
    const errorFields = errors.map((error) => error.property);
    expect(errorFields).toContain('employeeId');
    expect(errorFields).toContain('tableId');
    expect(errorFields.length).toBe(2);
  });
});
