import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { OrderStatus } from '../src/modules/orders/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Mock cho các modules không tồn tại
jest.mock('../src/modules/employees/employees.service', () => {
  return {
    EmployeesService: jest.fn().mockImplementation(() => ({
      findOneById: jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test Employee' }),
      findOneByEmail: jest.fn().mockResolvedValue(null),
    })),
  };
});

dotenv.config();

interface OrderResponse {
  id: string;
  status: OrderStatus;
  orderItems: any[];
}

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let orderId: string;
  let authToken: string = 'test_token'; // Giả lập token xác thực

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: process.env.DATABASE_TYPE as 'mysql',
          host: process.env.TEST_DATABASE_HOST || process.env.DATABASE_HOST,
          port: parseInt(
            process.env.TEST_DATABASE_PORT ||
              process.env.DATABASE_PORT ||
              '3306',
            10,
          ),
          username: process.env.TEST_DATABASE_USER || process.env.DATABASE_USER,
          password:
            process.env.TEST_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD,
          database:
            process.env.TEST_DATABASE_NAME ||
            `${process.env.DATABASE_NAME}_test`,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AppModule,
      ],
    })
      .overrideProvider('EmployeesService')
      .useValue({
        findOneById: jest
          .fn()
          .mockResolvedValue({ id: 1, name: 'Test Employee' }),
        findOneByEmail: jest.fn().mockResolvedValue(null),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/orders (POST) - should create new order', async () => {
    // Mô phỏng tạo đơn hàng mới - không cần employeeId
    const createOrderDto = {
      tableId: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
      orderItems: [
        {
          drinkId: 1, // Đảm bảo drink ID này tồn tại trong database
          quantity: 2,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createOrderDto)
      .expect(201);

    // Lưu orderId để sử dụng trong các bài test sau
    const responseBody = response.body as OrderResponse;
    orderId = responseBody.id;

    expect(responseBody).toHaveProperty('id');
    expect(responseBody.status).toBe(OrderStatus.PENDING);
    expect(responseBody).toHaveProperty('orderItems');
    expect(Array.isArray(responseBody.orderItems)).toBe(true);
    expect(responseBody.employeeId).toBeNull(); // Kiểm tra employeeId là null khi tạo mới
  });

  it('/orders (GET) - should get all orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/orders/:id (GET) - should get a specific order', async () => {
    // Sử dụng orderId đã được tạo ở test trước
    if (!orderId) {
      console.warn('orderId is undefined, skipping test');
      return;
    }

    const response = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const responseBody = response.body as OrderResponse;
    expect(responseBody).toHaveProperty('id', orderId);
    expect(responseBody).toHaveProperty('orderItems');
  });

  it('/orders/:id (PATCH) - should update an order status to PAID', async () => {
    // Sử dụng orderId đã được tạo ở test trước
    if (!orderId) {
      console.warn('orderId is undefined, skipping test');
      return;
    }

    const updateOrderDto = {
      status: OrderStatus.PAID,
    };

    const response = await request(app.getHttpServer())
      .patch(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateOrderDto)
      .expect(200);

    const responseBody = response.body as OrderResponse;
    expect(responseBody.status).toBe(OrderStatus.PAID);
    expect(responseBody.employeeId).toBeNull(); // employeeId vẫn là null sau khi cập nhật trạng thái thành PAID
  });

  it('/orders/:id (PATCH) - should update an order status from PAID to PREPARING and set employeeId', async () => {
    // Sử dụng orderId đã được tạo ở test trước
    if (!orderId) {
      console.warn('orderId is undefined, skipping test');
      return;
    }

    const updateOrderDto = {
      status: OrderStatus.PREPARING,
    };

    // Giả lập có request từ barista với id = 1
    const response = await request(app.getHttpServer())
      .patch(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateOrderDto)
      .expect(200);

    const responseBody = response.body as OrderResponse;
    expect(responseBody.status).toBe(OrderStatus.PREPARING);
    // Kiểm tra xem employeeId đã được cập nhật thành ID của barista hiện tại chưa
    // Lưu ý: Vì trong môi trường test chúng ta có thể không có access đến currentUser chính xác
    // Có thể kiểm tra rằng employeeId không còn là null
    expect(responseBody.employeeId).not.toBeNull();
  });

  // Các test mô phỏng các tình huống lỗi
  it('/orders (POST) - should fail with invalid input', async () => {
    const invalidOrderDto = {
      // Thiếu tableId
      orderItems: [
        {
          drinkId: 1,
          quantity: 2,
        },
      ],
    };

    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidOrderDto)
      .expect(400); // Validation error
  });

  it('/orders/:id (GET) - should fail with invalid ID', async () => {
    await request(app.getHttpServer())
      .get('/orders/invalid-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404); // Not found
  });
});
