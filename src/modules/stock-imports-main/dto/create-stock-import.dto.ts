import { ApiProperty } from '@nestjs/swagger';

export class CreateStockImportDto {
  @ApiProperty({
    description: 'ID của nhân viên tạo phiếu nhập kho',
    example: '1'
  })
  employeeId: number;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: '1'
  })
  supplierId: number;

  
}
