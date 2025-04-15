import { ApiProperty } from '@nestjs/swagger';

export class ProductStatisticsItemDto {
  @ApiProperty({ description: 'ID của đồ uống', example: '1' })
  id: number;

  @ApiProperty({ description: 'Tên đồ uống', example: 'Americano' })
  name: string;

  @ApiProperty({
    description: 'URL hình ảnh',
    example: 'https://example.com/coffee-image.jpg',
  })
  image_url: string;

  @ApiProperty({ description: 'Giá đồ uống', example: 35000 })
  price: string;

  @ApiProperty({ description: 'Số lượng đã bán', example: 42 })
  soldCount: number;

  @ApiProperty({ description: 'Doanh thu từ sản phẩm', example: 1470000 })
  revenue: number;
}

export class ProductStatisticsDto {
  @ApiProperty({ description: 'Tổng số sản phẩm đã bán', example: 520 })
  totalSold: number;

  @ApiProperty({
    description: 'Thống kê chi tiết theo sản phẩm',
    type: [ProductStatisticsItemDto],
  })
  products: ProductStatisticsItemDto[];
}
