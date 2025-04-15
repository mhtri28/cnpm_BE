// src/statistics/statistics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Drink } from '../drinks/entities/drink.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import {
  DateFilterType,
  StatisticsFilterDto,
} from './dtos/statistics-filter.dto';
import {
  DailyRevenueDto,
  RevenueStatisticsDto,
} from './dtos/revenue-statistics.dto';
import { ProductStatisticsItemDto } from './dtos/product-statistics.dto';
import { ProductStatisticsDto } from './dtos/product-statistics.dto';
import { OrderStatus } from '../orders/entities/order.entity';
import { PaymentStatus } from '../payments/entities/payment.entity';
import * as moment from 'moment';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Drink)
    private drinkRepository: Repository<Drink>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Tạo khoảng thời gian dựa vào filter
   */
  private getDateRange(filter: StatisticsFilterDto): {
    startDate: Date;
    endDate: Date;
  } {
    const today = moment().startOf('day');
    let startDate: Date;
    let endDate: Date = moment().endOf('day').toDate();

    switch (filter.dateType) {
      case DateFilterType.DAY:
        startDate = today.toDate();
        break;
      case DateFilterType.WEEK:
        startDate = moment().subtract(7, 'days').startOf('day').toDate();
        break;
      case DateFilterType.MONTH:
        startDate = moment().subtract(30, 'days').startOf('day').toDate();
        break;
      case DateFilterType.CUSTOM:
        if (filter.startDate && filter.endDate) {
          startDate = moment(filter.startDate).startOf('day').toDate();
          endDate = moment(filter.endDate).endOf('day').toDate();
        } else {
          // Mặc định 30 ngày gần nhất nếu không có range
          startDate = moment().subtract(30, 'days').startOf('day').toDate();
        }
        break;
      default:
        startDate = moment().subtract(30, 'days').startOf('day').toDate();
    }

    return { startDate, endDate };
  }

  /**
   * Lấy thống kê doanh thu
   */
  async getRevenueStatistics(
    filter: StatisticsFilterDto,
  ): Promise<RevenueStatisticsDto> {
    const { startDate, endDate } = this.getDateRange(filter);

    // Lấy các đơn hàng hoàn thành và đã thanh toán
    const completedOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: Between(startDate, endDate),
      },
      relations: ['payment', 'orderItems'],
    });

    // Lọc các đơn hàng có thanh toán thành công
    const paidOrders = completedOrders.filter(
      (order) =>
        order.payment && order.payment.status === PaymentStatus.COMPLETED,
    );

    // Tính tổng doanh thu
    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + parseFloat(order.payment.totalAmount.toString()),
      0,
    );

    // Tính số đơn hàng
    const totalOrders = paidOrders.length;

    // Tính giá trị đơn hàng trung bình
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Thống kê theo ngày
    const dailyStats = new Map<
      string,
      { revenue: number; orderCount: number }
    >();

    // Khởi tạo danh sách ngày từ startDate đến endDate
    let currentDate = moment(startDate);
    const lastDate = moment(endDate);

    while (currentDate <= lastDate) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      dailyStats.set(dateStr, { revenue: 0, orderCount: 0 });
      currentDate = currentDate.add(1, 'day');
    }

    // Tính thống kê cho từng ngày
    paidOrders.forEach((order) => {
      const orderDate = moment(order.createdAt).format('YYYY-MM-DD');
      const dailyStat = dailyStats.get(orderDate) || {
        revenue: 0,
        orderCount: 0,
      };

      dailyStat.revenue += parseFloat(order.payment.totalAmount.toString());
      dailyStat.orderCount += 1;

      dailyStats.set(orderDate, dailyStat);
    });

    // Chuyển đổi Map thành mảng kết quả
    const dailyRevenue: DailyRevenueDto[] = Array.from(
      dailyStats.entries(),
    ).map(([date, stat]) => ({
      date,
      revenue: stat.revenue,
      orderCount: stat.orderCount,
    }));

    // Sắp xếp theo ngày
    dailyRevenue.sort((a, b) => moment(a.date).diff(moment(b.date)));

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      dailyRevenue,
    };
  }

  /**
   * Lấy thống kê sản phẩm bán chạy
   */
  async getProductStatistics(
    filter: StatisticsFilterDto,
  ): Promise<ProductStatisticsDto> {
    const { startDate, endDate } = this.getDateRange(filter);

    // Lấy tất cả sản phẩm
    const allDrinks = await this.drinkRepository.find();

    // Lấy các order item trong khoảng thời gian
    const orderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.drink', 'drink')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('payment.status = :paymentStatus', {
        paymentStatus: PaymentStatus.COMPLETED,
      })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    // Tính tổng số lượng đã bán và doanh thu theo sản phẩm
    const productStats = new Map<
      number,
      { soldCount: number; revenue: number }
    >();

    // Khởi tạo với tất cả sản phẩm (để đảm bảo hiển thị cả những sản phẩm chưa bán được)
    allDrinks.forEach((drink) => {
      productStats.set(drink.id, { soldCount: 0, revenue: 0 });
    });

    // Cập nhật số lượng và doanh thu
    orderItems.forEach((item) => {
      const stats = productStats.get(item.drinkId) || {
        soldCount: 0,
        revenue: 0,
      };
      stats.soldCount += parseInt(item.quantity.toString());
      stats.revenue += parseFloat(item.subTotal.toString());
      productStats.set(item.drinkId, stats);
    });

    // Tạo kết quả chi tiết cho từng sản phẩm
    const products: ProductStatisticsItemDto[] = allDrinks.map((drink) => {
      const stats = productStats.get(drink.id) || { soldCount: 0, revenue: 0 };
      return {
        id: drink.id,
        name: drink.name,
        image_url: drink.image_url,
        price: drink.price.toString(),
        soldCount: stats.soldCount,
        revenue: stats.revenue,
      };
    });

    // Sắp xếp theo số lượng bán từ cao đến thấp
    products.sort((a, b) => b.soldCount - a.soldCount);

    // Tính tổng số lượng đã bán
    const totalSold = products.reduce(
      (sum, product) => sum + product.soldCount,
      0,
    );

    return {
      totalSold,
      products,
    };
  }

  /**
   * Lấy thống kê tổng hợp
   */
  async getDashboardStatistics(filter: StatisticsFilterDto) {
    const revenueStats = await this.getRevenueStatistics(filter);
    const productStats = await this.getProductStatistics(filter);

    // Lấy top 5 sản phẩm bán chạy nhất
    const topSellingProducts = productStats.products.slice(0, 5);

    return {
      revenue: {
        totalRevenue: revenueStats.totalRevenue,
        totalOrders: revenueStats.totalOrders,
        averageOrderValue: revenueStats.averageOrderValue,
      },
      products: {
        totalSold: productStats.totalSold,
        topSellingProducts,
      },
      dailyRevenue: revenueStats.dailyRevenue,
    };
  }
}
