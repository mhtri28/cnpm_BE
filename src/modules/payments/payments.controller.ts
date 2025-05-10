import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  Query,
  Logger,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response, Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentMethod } from './entities/payment.entity';

@ApiTags('Thanh toán')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Tạo thanh toán' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 200, description: 'Thanh toán được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Lỗi khi tạo thanh toán' })
  @Post('create-payment')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Tạo payment record với phương thức thanh toán từ DTO
      const payment = await this.paymentsService.createPayment(
        createPaymentDto.orderId,
        createPaymentDto.method,
      );

      // Nếu là thanh toán tiền mặt, trả về thông tin thanh toán ngay
      if (createPaymentDto.method === PaymentMethod.CASH) {
        return res.status(200).json({
          success: true,
          data: {
            payment,
            message: 'Thanh toán tiền mặt đã được ghi nhận',
          },
        });
      }

      // Nếu là thanh toán VNPay, tạo URL thanh toán
      // Lấy địa chỉ IP của người dùng
      const ipAddress =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        '127.0.0.1';

      // Tạo URL thanh toán
      const paymentUrl = await this.paymentsService.createPaymentUrl(
        payment,
        typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
      );

      return res.status(200).json({
        success: true,
        data: {
          paymentUrl,
          payment,
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Lỗi khi tạo thanh toán: ${error.message}`,
        error.stack,
      );
      return res.status(500).json({
        success: false,
        message: `Lỗi khi tạo thanh toán: ${error.message}`,
      });
    }
  }

  @ApiOperation({ summary: 'Xử lý thanh toán VNPay' })
  @ApiQuery({ type: Object })
  @ApiResponse({ status: 200, description: 'Thanh toán thành công' })
  @ApiResponse({
    status: 302,
    description: 'Chuyển hướng đến trang thành công hoặc thất bại',
  })
  @Get('vnpay-return')
  async handleVnpayReturn(@Query() query: any, @Res() res: Response) {
    try {
      const result = await this.paymentsService.handleVnpayReturn(query);

      if (result.success && result.payment) {
        // Chuyển hướng về trang thành công
        return res.redirect(
          `${process.env.PAYMENT_RESULT_REDIRECT_PREFIX_URL}/payment-success?orderId=${result.payment.orderId}`,
        );
      } else {
        // Chuyển hướng về trang thất bại
        return res.redirect(
          `${process.env.PAYMENT_RESULT_REDIRECT_PREFIX_URL}/payment-failed?message=${encodeURIComponent(result.message)}`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Lỗi khi xử lý VNPay return: ${error.message}`,
        error.stack,
      );
      return res.redirect(
       `${process.env.PAYMENT_RESULT_REDIRECT_PREFIX_URL}/payment-failed?message=${encodeURIComponent('Đã xảy ra lỗi khi xử lý thanh toán')}`,
      );
    }
  }

  @ApiOperation({ summary: 'Xử lý IPN VNPay' })
  @ApiQuery({ type: Object })
  @ApiResponse({ status: 200, description: 'IPN được xử lý thành công' })
  @ApiResponse({ status: 500, description: 'Lỗi xử lý IPN' })
  @Get('vnpay-ipn')
  async handleVnpayIpn(@Query() query: any, @Res() res: Response) {
    try {
      const result = await this.paymentsService.handleVnpayIpn(query);
      return res.status(200).json(result);
    } catch (error: any) {
      this.logger.error(
        `Lỗi khi xử lý VNPay IPN: ${error.message}`,
        error.stack,
      );
      return res.status(500).json({
        RspCode: '99',
        Message: 'Lỗi xử lý IPN',
      });
    }
  }

  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo ID đơn hàng' })
  @ApiParam({ name: 'orderId', type: String, description: 'ID của đơn hàng' })
  @ApiResponse({ status: 200, description: 'Thông tin thanh toán được trả về' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    const payment = await this.paymentsService.getPaymentByOrderId(orderId);
    if (!payment) {
      throw new NotFoundException(
        `Không tìm thấy thanh toán cho đơn hàng có ID: ${orderId}`,
      );
    }
    return payment;
  }

  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID của thanh toán' })
  @ApiResponse({ status: 200, description: 'Thông tin thanh toán được trả về' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thanh toán' })
  @Get(':id')
  async getPaymentById(@Param('id') id: string) {
    const payment = await this.paymentsService.getPaymentById(id);
    if (!payment) {
      throw new NotFoundException(`Không tìm thấy thanh toán có ID: ${id}`);
    }
    return payment;
  }
}
