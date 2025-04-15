// src/statistics/statistics.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { StatisticsFilterDto } from './dtos/statistics-filter.dto';
import { RevenueStatisticsDto } from './dtos/revenue-statistics.dto';
import { ProductStatisticsDto } from './dtos/product-statistics.dto';
import { AuthGuard } from 'src/guard/auth.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { EmployeeRole } from '../employees/entities/employee.entity';

@ApiTags('Thống kê')
@Controller('statistics')
@UseGuards(AuthGuard, RoleGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Lấy thống kê doanh thu' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê doanh thu trong khoảng thời gian',
    type: RevenueStatisticsDto,
  })
  @Roles(EmployeeRole.ADMIN)
  getRevenueStatistics(
    @Query() filter: StatisticsFilterDto,
  ): Promise<RevenueStatisticsDto> {
    return this.statisticsService.getRevenueStatistics(filter);
  }

  @Get('products')
  @ApiOperation({ summary: 'Lấy thống kê sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê sản phẩm đã bán trong khoảng thời gian',
    type: ProductStatisticsDto,
  })
  @Roles(EmployeeRole.ADMIN, EmployeeRole.BARISTA)
  getProductStatistics(
    @Query() filter: StatisticsFilterDto,
  ): Promise<ProductStatisticsDto> {
    return this.statisticsService.getProductStatistics(filter);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan cho dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê tổng quan bao gồm doanh thu và sản phẩm',
  })
  @Roles(EmployeeRole.ADMIN)
  getDashboardStatistics(@Query() filter: StatisticsFilterDto) {
    return this.statisticsService.getDashboardStatistics(filter);
  }
}
