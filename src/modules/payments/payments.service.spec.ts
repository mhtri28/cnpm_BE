import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { VNPay } from 'vnpay';
import { NotFoundException } from '@nestjs/common';

// Tạo các mock cho thư viện
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

jest.mock('vnpay', () => {
  return {
    VNPay: jest.fn().mockImplementation(() => ({
      buildPaymentUrl: jest
        .fn()
        .mockResolvedValue('https://sandbox.vnpayment.vn/payment-url'),
      verifyReturnUrl: jest.fn().mockResolvedValue({
        isSuccess: true,
        message: 'Thành công',
        vnp_Amount: 10000,
        vnp_TxnRef: 'test-uuid',
      }),
    })),
    VnpLocale: {
      VN: 'vn',
    },
    ProductCode: {
      Other: 'other',
    },
  };
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: Repository<Payment>;
  let orderRepository: Repository<Order>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            save: jest.fn().mockImplementation((payment) => ({
              ...payment,
              id: payment.id || 'test-uuid', // Đảm bảo id được gán
            })),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'vnpay.tmnCode': 'VAAJN51S',
                'vnpay.secureSecret': 'UNOBMR165GLWAXUC51RO1I89FWIBH6V8',
                'vnpay.vnpayHost':
                  'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
                'vnpay.returnUrl':
                  'http://localhost:3000/api/v1/payments/vnpay-return',
                'vnpay.testMode': true,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment record when order exists and has no payment', async () => {
      const orderId = 'order-123';
      const amount = 100000;
      const order = new Order();
      order.id = orderId;

      // Mock order exists
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);
      // Mock no existing payment for order
      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(null);

      const result = await service.createPayment(orderId, amount);

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(paymentRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('test-uuid');
      expect(result.orderId).toBe(orderId);
      expect(result.totalAmount).toBe(amount);
      expect(result.method).toBe(PaymentMethod.VNPAY);
      expect(result.status).toBe(PaymentStatus.PENDING);
    });

    it('should throw NotFoundException when order does not exist', async () => {
      const orderId = 'non-existent-order';
      const amount = 100000;

      // Mock order does not exist
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createPayment(orderId, amount)).rejects.toThrow(
        NotFoundException,
      );
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });

    it('should throw Error when order already has a payment', async () => {
      const orderId = 'order-with-payment';
      const amount = 100000;
      const order = new Order();
      order.id = orderId;

      const existingPayment = new Payment();
      existingPayment.orderId = orderId;

      // Mock order exists
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);
      // Mock existing payment for order
      jest
        .spyOn(paymentRepository, 'findOne')
        .mockResolvedValue(existingPayment);

      await expect(service.createPayment(orderId, amount)).rejects.toThrow(
        `Đơn hàng với ID ${orderId} đã có thanh toán liên kết`,
      );
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { orderId },
      });
    });
  });

  describe('createPaymentUrl', () => {
    it('should create a payment URL', async () => {
      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000;

      const ipAddress = '127.0.0.1';

      const result = await service.createPaymentUrl(payment, ipAddress);

      expect(result).toBe('https://sandbox.vnpayment.vn/payment-url');
    });
  });

  describe('handleVnpayReturn', () => {
    it('should process a successful payment return', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
        vnp_Amount: '10000000', // *100
        vnp_TransactionNo: '12345678',
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000;
      payment.status = PaymentStatus.PENDING;

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);
      jest.spyOn(paymentRepository, 'save').mockResolvedValue(payment);

      const order = new Order();
      order.id = 'order-123';

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(order);

      const result = await service.handleVnpayReturn(query);

      expect(result.success).toBe(true);
      expect(result.payment).toBe(payment);
      expect(result.message).toBe('Thanh toán thành công');
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
      expect(payment.transactionId).toBe('12345678');
      expect(order.status).toBe('paid');
    });

    it('should not modify payment if already completed', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
        vnp_Amount: '10000000', // *100
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000;
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = 87654321;

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);

      const result = await service.handleVnpayReturn(query);

      expect(result.success).toBe(true);
      expect(result.payment).toBe(payment);
      expect(result.message).toBe('Thanh toán đã được xử lý trước đó');
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
      expect(payment.transactionId).toBe(87654321); // Should not change
      expect(paymentRepository.save).not.toHaveBeenCalled();
    });

    it('should handle payment not found', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
      };

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(null);

      const result = await service.handleVnpayReturn(query);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Lỗi xử lý thanh toán');
    });
  });

  describe('handleVnpayIpn', () => {
    it('should process a successful IPN notification', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
        vnp_Amount: '10000000', // *100
        vnp_TransactionNo: '12345678',
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000;
      payment.status = PaymentStatus.PENDING;

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);
      jest.spyOn(paymentRepository, 'save').mockResolvedValue(payment);

      const order = new Order();
      order.id = 'order-123';

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(order);

      const result = await service.handleVnpayIpn(query);

      expect(result.RspCode).toBe('00');
      expect(result.Message).toBe('Xác nhận thành công');
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
      expect(payment.transactionId).toBe('12345678');
      expect(order.status).toBe('paid');
    });

    it('should not process IPN if payment already completed', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
        vnp_Amount: '10000000', // *100
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000;
      payment.status = PaymentStatus.COMPLETED;

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);

      const result = await service.handleVnpayIpn(query);

      expect(result.RspCode).toBe('00');
      expect(result.Message).toBe('Giao dịch đã được xử lý');
      expect(paymentRepository.save).not.toHaveBeenCalled();
    });

    it("should return error when payment amount doesn't match", async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
        vnp_Amount: '50000000', // Different amount than stored payment
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000; // Different than vnp_Amount/100
      payment.status = PaymentStatus.PENDING;

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);

      const result = await service.handleVnpayIpn(query);

      expect(result.RspCode).toBe('04');
      expect(result.Message).toBe('Số tiền không hợp lệ');
    });

    it('should handle payment not found in IPN', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
      };

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(null);

      const result = await service.handleVnpayIpn(query);

      expect(result.RspCode).toBe('01');
      expect(result.Message).toBe('Không tìm thấy thông tin thanh toán');
    });

    it('should handle missing order in IPN', async () => {
      const query = {
        vnp_TxnRef: 'test-uuid',
        vnp_Amount: '10000000', // *100
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';
      payment.totalAmount = 100000;
      payment.status = PaymentStatus.PENDING;

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);
      jest.spyOn(paymentRepository, 'save').mockResolvedValue(payment);
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      const result = await service.handleVnpayIpn(query);

      expect(result.RspCode).toBe('00');
      expect(result.Message).toBe('Xác nhận thành công');
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
      // Order not updated because it wasn't found
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentById and getPaymentByOrderId', () => {
    it('should find payment by id', async () => {
      const payment = new Payment();
      payment.id = 'test-uuid';

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);

      const result = await service.getPaymentById('test-uuid');

      expect(result).toBe(payment);
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
      });
    });

    it('should find payment by orderId', async () => {
      const payment = new Payment();
      payment.orderId = 'order-123';

      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(payment);

      const result = await service.getPaymentByOrderId('order-123');

      expect(result).toBe(payment);
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { orderId: 'order-123' },
      });
    });
  });
});
