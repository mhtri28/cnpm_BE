import { ApiProperty } from '@nestjs/swagger';

export class DailyRevenueDto {
  @ApiProperty({ description: 'Ngày thống kê', example: '2025-04-10' })
  date: string;

  @ApiProperty({ description: 'Doanh thu trong ngày', example: 1250000 })
  revenue: number;

  @ApiProperty({ description: 'Số đơn hàng trong ngày', example: 25 })
  orderCount: number;
}

export class RevenueStatisticsDto {
  @ApiProperty({ description: 'Tổng doanh thu', example: 15000000 })
  totalRevenue: number;

  @ApiProperty({ description: 'Tổng số đơn hàng', example: 300 })
  totalOrders: number;

  @ApiProperty({
    description: 'Doanh thu trung bình theo đơn hàng',
    example: 50000,
  })
  averageOrderValue: number;

  @ApiProperty({
    description: 'Thống kê doanh thu theo ngày',
    type: [DailyRevenueDto],
  })
  dailyRevenue: DailyRevenueDto[];
}
