import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

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

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
