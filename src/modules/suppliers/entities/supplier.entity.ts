import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from '../../stock-imports-main/entities/stock-import.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'suppliers' })
export class Supplier {
  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({
    description: 'Tên nhà cung cấp',
    example: 'Công ty TNHH Thực phẩm ABC',
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    description: 'Số điện thoại nhà cung cấp',
    example: '0123456789',
  })
  @Column({ length: 10, unique: true })
  phone: string;

  @ApiProperty({
    description: 'Email nhà cung cấp',
    example: 'supplier@abc.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Địa chỉ nhà cung cấp',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @Column({ length: 50 })
  address: string;

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
    description: 'Danh sách phiếu nhập kho của nhà cung cấp',
    type: () => [StockImport],
  })
  @OneToMany(() => StockImport, (stockImport) => stockImport.supplier)
  stockImports: StockImport[];

  @ApiProperty({
    description: 'Danh sách nguyên liệu của nhà cung cấp',
    type: () => [Ingredient],
  })
  @OneToMany('Ingredient', 'supplier')
  ingredients: Ingredient[];
}
