import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { StockImportItem } from './stock-import-item.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('stock_imports')
export class StockImport {
  @ApiProperty({
    description: 'ID của phiếu nhập kho',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ApiProperty({
    description: 'ID của nhân viên tạo phiếu',
    example: 1,
  })
  @Column({ type: 'bigint', unsigned: true })
  employeeId: number;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 1,
  })
  @Column({ type: 'bigint', unsigned: true })
  supplierId: number;

  @ApiProperty({
    description: 'Tổng giá trị phiếu nhập',
    example: 1000000.0,
  })
  @Column('decimal', { precision: 12, scale: 2 })
  totalCost: number;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2023-10-20T08:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật gần nhất',
    example: '2023-10-21T10:45:00Z',
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thời gian xóa',
    example: null,
  })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ApiProperty({
    description: 'Thông tin nhân viên tạo phiếu',
    type: () => Employee,
  })
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({
    description: 'Thông tin nhà cung cấp',
    type: () => Supplier,
  })
  @ManyToOne(() => Supplier, (supplier) => supplier.stockImports)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ApiProperty({
    description: 'Danh sách chi tiết phiếu nhập kho',
    type: () => [StockImportItem],
  })
  @OneToMany(
    () => StockImportItem,
    (stockImportItem) => stockImportItem.stockImport,
  )
  stockImportItems: StockImportItem[];
}
