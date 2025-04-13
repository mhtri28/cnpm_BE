import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { StockImport } from './stock-import.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('stock_import_items')
export class StockImportItem {
  @ApiProperty({
    description: 'ID của chi tiết phiếu nhập kho',
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ApiProperty({
    description: 'ID của nguyên liệu',
    example: 1
  })
  @Column({ type: 'bigint', unsigned: true })
  ingredientId: number;

  @ApiProperty({
    description: 'ID của phiếu nhập kho',
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @Column({ type: 'varchar', length: 36 })
  stockImportId: string;

  @ApiProperty({
    description: 'Đơn giá nhập',
    example: 50000.00
  })
  @Column('decimal', { precision: 8, scale: 2 })
  unitPrice: number;

  @ApiProperty({
    description: 'Số lượng nhập',
    example: 100
  })
  @Column({ type: 'bigint' })
  quantity: number;

  @ApiProperty({
    description: 'Thành tiền',
    example: 5000000.00
  })
  @Column('decimal', { precision: 10, scale: 2 })
  subTotal: number;

  @ApiProperty({
    description: 'Thông tin nguyên liệu',
    type: () => Ingredient
  })
  @ManyToOne(() => Ingredient, (ingredient) => ingredient.stockImportItems)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;

  @ApiProperty({
    description: 'Thông tin phiếu nhập kho',
    type: () => StockImport
  })
  @ManyToOne(() => StockImport, (stockImport) => stockImport.stockImportItems)
  @JoinColumn({ name: 'stockImportId' })
  stockImport: StockImport;
}
