// Mock EmployeesService
jest.mock('../src/modules/employees/employees.service', () => {
  return {
    EmployeesService: jest.fn().mockImplementation(() => ({
      findOneById: jest.fn().mockResolvedValue({ id: 1, name: 'Test Employee' }),
      findOneByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, name: 'Test Employee' }),
      findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Employee' }]),
    })),
  };
}, { virtual: true });

// Mock AuthService
jest.mock('../src/guard/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      validateUser: jest.fn().mockResolvedValue({ id: 1, username: 'test' }),
      login: jest.fn().mockResolvedValue({ access_token: 'test-token' }),
      register: jest.fn().mockResolvedValue({ id: 1, username: 'test' }),
    })),
  };
}, { virtual: true });

// Mock JwtService
jest.mock('@nestjs/jwt', () => {
  return {
    JwtService: jest.fn().mockImplementation(() => ({
      sign: jest.fn().mockReturnValue('test-token'),
      verify: jest.fn().mockReturnValue({ id: 1, username: 'test' }),
    })),
  };
}, { virtual: true });

// Bổ sung thêm các mock cho các modules khác nếu cần
