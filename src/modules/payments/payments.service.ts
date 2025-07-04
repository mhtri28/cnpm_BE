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

  async createPayment(
    orderId: string,
    method: PaymentMethod = PaymentMethod.VNPAY,
  ): Promise<Payment> {
    // Kiểm tra order có tồn tại không
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${orderId}`);
    }

    // Kiểm tra xem order đã có payment chưa
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (existingPayment) {
      throw new Error(`Đơn hàng với ID ${orderId} đã có thanh toán liên kết`);
    }

    // Tính tổng tiền từ orderItems
    let totalAmount = 0;
    if (order.orderItems && order.orderItems.length > 0) {
      totalAmount = order.orderItems.reduce((sum, item) => {
        return sum + parseFloat(item.subTotal.toString());
      }, 0);
    } else {
      throw new Error(`Đơn hàng với ID ${orderId} không có sản phẩm nào`);
    }

    const payment = new Payment();
    payment.id = uuidv4();
    payment.orderId = orderId;
    payment.totalAmount = totalAmount;
    payment.method = method;
    payment.status = PaymentStatus.PENDING;
    payment.transactionId = null;

    // Nếu là thanh toán tiền mặt, cập nhật trạng thái thành COMPLETED
    if (method === PaymentMethod.CASH) {
      payment.status = PaymentStatus.COMPLETED;

      // Cập nhật trạng thái đơn hàng thành paid
      order.status = 'paid' as any;
      await this.orderRepository.save(order);
    }

    return this.paymentRepository.save(payment);
  }

  async createPaymentUrl(payment: Payment, ipAddress: string): Promise<string> {
    const returnUrl = this.configService.get<string>('vnpay.returnUrl');

    try {
      const url = await this.vnpay.buildPaymentUrl({
        vnp_Amount: payment.totalAmount, // VNPay library already multiplies by 100 internally
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

      // Trả về sớm nếu thanh toán đã hoàn thành hoặc đã thất bại
      if (
        payment.status === PaymentStatus.COMPLETED ||
        payment.status === PaymentStatus.FAILED
      ) {
        return {
          success: payment.status === PaymentStatus.COMPLETED,
          payment,
          message:
            payment.status === PaymentStatus.COMPLETED
              ? 'Thanh toán đã được xử lý trước đó'
              : 'Thanh toán đã bị hủy trước đó',
        };
      }

      // Cập nhật trạng thái thanh toán
      payment.status = verifyResult.isSuccess
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;
      if (query.vnp_TransactionNo) {
        payment.transactionId = query.vnp_TransactionNo;
      }
      await this.paymentRepository.save(payment);

      // Lấy thông tin đơn hàng
      const order = await this.orderRepository.findOne({
        where: { id: payment.orderId },
      });

      if (order) {
        // Cập nhật trạng thái đơn hàng dựa vào kết quả thanh toán
        if (verifyResult.isSuccess) {
          // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng thành paid
          order.status = 'paid' as any;
        } else {
          // Nếu thanh toán thất bại, cập nhật trạng thái đơn hàng thành canceled
          order.status = 'canceled' as any;
        }
        await this.orderRepository.save(order);
      }

      return {
        success: verifyResult.isSuccess,
        payment,
        message: verifyResult.isSuccess
          ? 'Thanh toán thành công'
          : verifyResult.message || 'Thanh toán thất bại',
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

      // Chỉ cập nhật trạng thái thanh toán và transactionId
      payment.status = PaymentStatus.COMPLETED;
      if (query.vnp_TransactionNo) {
        payment.transactionId = query.vnp_TransactionNo;
      }
      await this.paymentRepository.save(payment);

      // Cập nhật trạng thái đơn hàng thành paid
      const order = await this.orderRepository.findOne({
        where: { id: payment.orderId },
      });
      if (order) {
        order.status = 'paid' as any; // Cast to any để tránh lỗi TypeScript
        await this.orderRepository.save(order);
      } else {
        this.logger.warn(
          `Không tìm thấy đơn hàng với ID: ${payment.orderId} khi xử lý IPN`,
        );
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
