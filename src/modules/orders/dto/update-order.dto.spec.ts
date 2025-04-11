import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderDto } from './update-order.dto';
import { OrderStatus } from '../entities/order.entity';

describe('UpdateOrderDto', () => {
  let dto: UpdateOrderDto;

  beforeEach(() => {
    dto = new UpdateOrderDto();
  });

  it('should be valid with valid fields', async () => {
    dto.status = OrderStatus.PAID;
    dto.tableId = 'table1';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be valid with empty DTO (all fields optional)', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should be invalid with invalid status', async () => {
    dto.status = 'invalid_status' as OrderStatus;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should transform plain objects', () => {
    const plainObject = {
      status: OrderStatus.PAID,
      tableId: 'table1',
    };

    const dtoInstance = plainToInstance(UpdateOrderDto, plainObject);
    expect(dtoInstance).toBeInstanceOf(UpdateOrderDto);
    expect(dtoInstance.status).toBe(OrderStatus.PAID);
    expect(dtoInstance.tableId).toBe('table1');
  });

  it('should accept partial updates', async () => {
    // Only update status
    let partialDto = new UpdateOrderDto();
    partialDto.status = OrderStatus.PAID;

    let errors = await validate(partialDto);
    expect(errors.length).toBe(0);

    // Only update tableId
    partialDto = new UpdateOrderDto();
    partialDto.tableId = 'table2';

    errors = await validate(partialDto);
    expect(errors.length).toBe(0);
  });
});
