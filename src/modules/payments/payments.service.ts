import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { VNPay, VnpLocale, ProductCode } from 'vnpay';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private vnpay: VNPay;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {
    this.vnpay = new VNPay({
      tmnCode: this.configService.get<string>('vnpay.tmnCode') || '',
      secureSecret: this.configService.get<string>('vnpay.secureSecret') || '',
      vnpayHost: this.configService.get<string>('vnpay.vnpayHost'),
      testMode: this.configService.get<boolean>('vnpay.testMode'),
    });
  }

  async createPayment(orderId: string, amount: number): Promise<Payment> {
    const payment = new Payment();
    payment.id = uuidv4();
    payment.orderId = orderId;
    payment.totalAmount = amount;
    payment.method = PaymentMethod.VNPAY;
    payment.status = PaymentStatus.PENDING;

    // Cách 1: Để trống transactionId ban đầu
    payment.transactionId = null;

    // Cách 2: Sử dụng localTransactionId và vnpTransactionId
    /*
    payment.localTransactionId = Date.now();
    payment.vnpTransactionId = null;
    */

    return this.paymentRepository.save(payment);
  }

  async createPaymentUrl(payment: Payment, ipAddress: string): Promise<string> {
    const returnUrl = this.configService.get<string>('vnpay.returnUrl');

    try {
      const url = await this.vnpay.buildPaymentUrl({
        vnp_Amount: payment.totalAmount * 100, // VNPay yêu cầu số tiền * 100 (VNĐ * 100)
        vnp_IpAddr: ipAddress,
        vnp_TxnRef: payment.id, // Sử dụng payment.id để làm mã tham chiếu
        vnp_OrderInfo: `Thanh toan don hang ${payment.orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl || '',
        vnp_Locale: VnpLocale.VN,
      });

      return url;
    } catch (error: any) {
      this.logger.error(
        `Lỗi khi tạo URL thanh toán: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleVnpayReturn(query: any): Promise<{
    success: boolean;
    payment?: Payment;
    message: string;
  }> {
    try {
      const verifyResult = await this.vnpay.verifyReturnUrl(query);

      if (!verifyResult.isSuccess) {
        return {
          success: false,
          message: verifyResult.message || 'Xác thực thanh toán thất bại',
        };
      }

      // Lấy payment từ database dựa vào vnp_TxnRef (payment.id)
      const paymentId = query.vnp_TxnRef as string;
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException(
          `Không tìm thấy thông tin thanh toán với ID: ${paymentId}`,
        );
      }

      // Cập nhật trạng thái thanh toán
      payment.status = verifyResult.isSuccess
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;
      payment.transactionId = query.vnp_TransactionNo;
      await this.paymentRepository.save(payment);

      // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng thành paid
      if (verifyResult.isSuccess) {
        const order = await this.orderRepository.findOne({
          where: { id: payment.orderId },
        });
        if (order) {
          order.status = 'paid' as any; // Cast to any để tránh lỗi TypeScript
          await this.orderRepository.save(order);
        }
      }

      return {
        success: true,
        payment,
        message: 'Thanh toán thành công',
      };
    } catch (error: any) {
      this.logger.error(
        `Lỗi khi xử lý kết quả thanh toán: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Lỗi xử lý thanh toán: ${error.message}`,
      };
    }
  }

  async handleVnpayIpn(query: any): Promise<{
    RspCode: string;
    Message: string;
  }> {
    try {
      const verifyResult = await this.vnpay.verifyReturnUrl(query);

      if (!verifyResult.isSuccess) {
        return {
          RspCode: '99',
          Message: 'Xác thực thất bại',
        };
      }

      // Lấy payment từ database
      const paymentId = query.vnp_TxnRef as string;
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        return {
          RspCode: '01',
          Message: 'Không tìm thấy thông tin thanh toán',
        };
      }

      // Kiểm tra số tiền
      const vnpAmount = parseInt(query.vnp_Amount as string) / 100; // VNPay trả về số tiền * 100
      if (vnpAmount !== payment.totalAmount) {
        return {
          RspCode: '04',
          Message: 'Số tiền không hợp lệ',
        };
      }

      // Nếu thanh toán đã hoàn thành, không xử lý nữa
      if (payment.status === PaymentStatus.COMPLETED) {
        return {
          RspCode: '00',
          Message: 'Giao dịch đã được xử lý',
        };
      }

      // Cập nhật trạng thái thanh toán thành công
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = query.vnp_TransactionNo;
      await this.paymentRepository.save(payment);

      // Cập nhật trạng thái đơn hàng thành paid
      const order = await this.orderRepository.findOne({
        where: { id: payment.orderId },
      });
      if (order) {
        order.status = 'paid' as any; // Cast to any để tránh lỗi TypeScript
        await this.orderRepository.save(order);
      }

      return {
        RspCode: '00',
        Message: 'Xác nhận thành công',
      };
    } catch (error: any) {
      this.logger.error(`Lỗi khi xử lý IPN: ${error.message}`, error.stack);
      return {
        RspCode: '99',
        Message: 'Lỗi xử lý IPN',
      };
    }
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { id } });
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { orderId } });
  }
}
