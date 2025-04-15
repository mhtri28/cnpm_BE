import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { NotFoundException } from '@nestjs/common';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const mockPaymentsService = {
      createPayment: jest.fn(),
      createPaymentUrl: jest.fn(),
      handleVnpayReturn: jest.fn(),
      handleVnpayIpn: jest.fn(),
      getPaymentById: jest.fn(),
      getPaymentByOrderId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment and return payment URL', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: 'order-123',
        totalAmount: 100000,
        method: PaymentMethod.VNPAY,
      };

      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = createPaymentDto.orderId;
      payment.totalAmount = createPaymentDto.totalAmount;
      payment.method = PaymentMethod.VNPAY;
      payment.status = PaymentStatus.PENDING;

      const paymentUrl = 'https://sandbox.vnpayment.vn/payment-url';

      jest.spyOn(service, 'createPayment').mockResolvedValue(payment);
      jest.spyOn(service, 'createPaymentUrl').mockResolvedValue(paymentUrl);

      const req = {
        headers: { 'x-forwarded-for': '127.0.0.1' },
        connection: { remoteAddress: null },
        socket: { remoteAddress: null },
        ip: null,
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.createPayment(createPaymentDto, req as any, res as any);

      expect(service.createPayment).toHaveBeenCalledWith(
        createPaymentDto.orderId,
        createPaymentDto.totalAmount,
      );
      expect(service.createPaymentUrl).toHaveBeenCalledWith(
        payment,
        '127.0.0.1',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          paymentUrl,
          payment,
        },
      });
    });

    it('should handle errors during payment creation', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: 'order-123',
        totalAmount: 100000,
        method: PaymentMethod.VNPAY,
      };

      const error = new Error('Test error');
      jest.spyOn(service, 'createPayment').mockRejectedValue(error);

      const req = {
        headers: { 'x-forwarded-for': '127.0.0.1' },
        connection: { remoteAddress: null },
        socket: { remoteAddress: null },
        ip: null,
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.createPayment(createPaymentDto, req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Lỗi khi tạo thanh toán: Test error',
      });
    });

    it('should handle non-existent order error', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: 'non-existent-order',
        totalAmount: 100000,
        method: PaymentMethod.VNPAY,
      };

      // Simulate NotFoundException for non-existent order
      const error = new NotFoundException(
        'Không tìm thấy đơn hàng với ID: non-existent-order',
      );
      jest.spyOn(service, 'createPayment').mockRejectedValue(error);

      const req = {
        headers: { 'x-forwarded-for': '127.0.0.1' },
        connection: { remoteAddress: null },
        socket: { remoteAddress: null },
        ip: null,
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.createPayment(createPaymentDto, req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Không tìm thấy đơn hàng'),
      });
    });

    it('should handle duplicate payment error', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: 'order-with-payment',
        totalAmount: 100000,
        method: PaymentMethod.VNPAY,
      };

      // Simulate Error for order already having a payment
      const error = new Error(
        'Đơn hàng với ID order-with-payment đã có thanh toán liên kết',
      );
      jest.spyOn(service, 'createPayment').mockRejectedValue(error);

      const req = {
        headers: { 'x-forwarded-for': '127.0.0.1' },
        connection: { remoteAddress: null },
        socket: { remoteAddress: null },
        ip: null,
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.createPayment(createPaymentDto, req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('đã có thanh toán liên kết'),
      });
    });
  });

  describe('handleVnpayReturn', () => {
    it('should redirect to success page on successful payment', async () => {
      const query = { vnp_TxnRef: 'test-uuid' };
      const payment = new Payment();
      payment.id = 'test-uuid';
      payment.orderId = 'order-123';

      const returnResult = {
        success: true,
        payment,
        message: 'Thanh toán thành công',
      };

      jest.spyOn(service, 'handleVnpayReturn').mockResolvedValue(returnResult);

      const res = {
        redirect: jest.fn(),
      };

      await controller.handleVnpayReturn(query, res as any);

      expect(service.handleVnpayReturn).toHaveBeenCalledWith(query);
      expect(res.redirect).toHaveBeenCalledWith(
        '/payment-success?orderId=order-123',
      );
    });

    it('should redirect to failure page on payment failure', async () => {
      const query = { vnp_TxnRef: 'test-uuid' };
      const returnResult = {
        success: false,
        message: 'Thanh toán thất bại',
      };

      jest.spyOn(service, 'handleVnpayReturn').mockResolvedValue(returnResult);

      const res = {
        redirect: jest.fn(),
      };

      await controller.handleVnpayReturn(query, res as any);

      expect(service.handleVnpayReturn).toHaveBeenCalledWith(query);
      expect(res.redirect).toHaveBeenCalledWith(
        '/payment-failed?message=Thanh%20to%C3%A1n%20th%E1%BA%A5t%20b%E1%BA%A1i',
      );
    });

    it('should handle errors during payment return processing', async () => {
      const query = { vnp_TxnRef: 'test-uuid' };
      const error = new Error('Test error');

      jest.spyOn(service, 'handleVnpayReturn').mockRejectedValue(error);

      const res = {
        redirect: jest.fn(),
      };

      await controller.handleVnpayReturn(query, res as any);

      expect(res.redirect).toHaveBeenCalledWith(
        '/payment-failed?message=%C4%90%C3%A3%20x%E1%BA%A3y%20ra%20l%E1%BB%97i%20khi%20x%E1%BB%AD%20l%C3%BD%20thanh%20to%C3%A1n',
      );
    });
  });

  describe('handleVnpayIpn', () => {
    it('should process IPN notification successfully', async () => {
      const query = { vnp_TxnRef: 'test-uuid' };
      const ipnResult = {
        RspCode: '00',
        Message: 'Xác nhận thành công',
      };

      jest.spyOn(service, 'handleVnpayIpn').mockResolvedValue(ipnResult);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.handleVnpayIpn(query, res as any);

      expect(service.handleVnpayIpn).toHaveBeenCalledWith(query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ipnResult);
    });

    it('should handle errors during IPN processing', async () => {
      const query = { vnp_TxnRef: 'test-uuid' };
      const error = new Error('Test error');

      jest.spyOn(service, 'handleVnpayIpn').mockRejectedValue(error);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.handleVnpayIpn(query, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        RspCode: '99',
        Message: 'Lỗi xử lý IPN',
      });
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by id', async () => {
      const paymentId = 'test-uuid';
      const payment = new Payment();
      payment.id = paymentId;

      jest.spyOn(service, 'getPaymentById').mockResolvedValue(payment);

      const result = await controller.getPaymentById(paymentId);

      expect(service.getPaymentById).toHaveBeenCalledWith(paymentId);
      expect(result).toBe(payment);
    });

    it('should throw NotFoundException when payment not found by id', async () => {
      const paymentId = 'test-uuid';

      jest.spyOn(service, 'getPaymentById').mockResolvedValue(null);

      await expect(controller.getPaymentById(paymentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should return a payment by orderId', async () => {
      const orderId = 'order-123';
      const payment = new Payment();
      payment.orderId = orderId;

      jest.spyOn(service, 'getPaymentByOrderId').mockResolvedValue(payment);

      const result = await controller.getPaymentByOrderId(orderId);

      expect(service.getPaymentByOrderId).toHaveBeenCalledWith(orderId);
      expect(result).toBe(payment);
    });

    it('should throw NotFoundException when payment not found by orderId', async () => {
      const orderId = 'order-123';

      jest.spyOn(service, 'getPaymentByOrderId').mockResolvedValue(null);

      await expect(controller.getPaymentByOrderId(orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});