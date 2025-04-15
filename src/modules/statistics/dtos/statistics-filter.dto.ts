import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum DateFilterType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export class StatisticsFilterDto {
  @ApiProperty({
    description: 'Loại thời gian thống kê',
    enum: DateFilterType,
    default: DateFilterType.MONTH,
  })
  @IsEnum(DateFilterType)
  @IsOptional()
  dateType?: DateFilterType = DateFilterType.MONTH;

  @ApiProperty({
    description: 'Ngày bắt đầu (format: YYYY-MM-DD) cho custom date range',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Ngày kết thúc (format: YYYY-MM-DD) cho custom date range',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
