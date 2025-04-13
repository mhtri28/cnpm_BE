import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { StockImportItem } from '../../stock-imports-main/entities/stock-import-item.entity';

@Entity('ingredients')
export class Ingredient {
  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: "1"
  })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({
    description: 'Tên nguyên liệu',
    example: "Coffee Beans"
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    description: 'Số lượng hiện có',
    example: "1000.5"
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  availableCount: number;

  @ApiProperty({
    description: 'Đơn vị tính',
    example: 'gram'
  })
  @Column({ length: 20 })
  unit: string;

  @ApiProperty({
    description: 'ID của nhà cung cấp',
    example: 1
  })
  @Column({ type: 'bigint', unsigned: true })
  supplierId: number;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: "2025-04-10T05:14:18.800Z"
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật gần nhất',
    example: "2025-04-10T05:14:18.800Z"
  })
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ApiProperty({
    description: 'Thời gian xóa',
    example: null
  })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ApiProperty({
    description: 'Thông tin nhà cung cấp',
    type: () => Supplier
  })
  @ManyToOne(() => Supplier, (supplier) => supplier.ingredients)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @ApiProperty({
    description: 'Danh sách phiếu nhập kho của nguyên liệu',
    type: () => [StockImportItem]
  })
  @OneToMany(() => StockImportItem, (stockImportItem) => stockImportItem.ingredient)
  stockImportItems: StockImportItem[];

  @ApiProperty({
    description: 'Danh sách công thức sử dụng nguyên liệu này',
    type: () => [Recipe]
  })
  @OneToMany(() => Recipe, (recipe) => recipe.ingredient)
  recipes: Recipe[];
}
